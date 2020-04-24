let error = () => { throw "error: cannot demangle"; };
let todo = () => { throw "sorry: unimplemented demangling"; };
export class Demangler {
    constructor(input, index = 0) {
        this.input = input;
        this.index = index;
        this.names = { stored: [[]], active: 0 };
        this.types = { stored: [[]], active: 0 };
    }
    dump() {
        return `${this.input.slice(0, this.index)} | ${this.input[this.index]} | ${this.input.slice(this.index + 1)}`;
    }
    parse(context, prefix = '') {
        return (map) => {
            let c = this.input[this.index];
            let call = (f) => {
                if (this.index > this.input.length)
                    throw `error: unexpected end of string when demangling ${context}\nsource string: ${this.dump()}`;
                else if (f === error)
                    throw `error: cannot demangle ${context} that starts with '${prefix}${c}'\nsource string: ${this.dump()}`;
                else if (f === todo)
                    throw `sorry: unimplemented ${context} demangling of '${prefix}${c}'\nsource string: ${this.dump()}`;
                else
                    return f();
            };
            if (map[c]) {
                this.index++;
                return call(map[c]);
            }
            if (/\d/.test(c) && map['0-9']) {
                this.index++;
                return map['0-9'](+c);
            }
            return call(map.default || error);
        };
    }
    parse_list(f) {
        const list = [];
        while (this.input[this.index] !== '@') {
            list.push(f());
        }
        this.index++;
        return list;
    }
    parse_source_name() {
        const spelling = this.input.slice(this.index, this.input.indexOf('@', this.index));
        this.index += spelling.length + 1;
        return spelling;
    }
    parse_integer() {
        const sign = this.parse("number")({
            '?': () => -1n,
            default: () => 1n,
        });
        const value = this.parse("number")({
            '0-9': (n) => BigInt(n + 1),
            default: () => {
                const numstring = this.parse_source_name();
                return BigInt('0x0' + numstring.replace(/./g, (s) => 'ABCDEFGHIJKLMNOP'.indexOf(s).toString(16)));
            },
        });
        return sign * value;
    }
    parse_string_literal_name() {
        const wide = this.parse("string literal width")({
            '0': () => ({}),
            '1': () => ({ wide: 'wide' }),
        });
        let [length, crc, str] = [this.parse_integer(), this.parse_source_name(), this.parse_source_name()];
        const [ord_diff, hex] = [(s, t) => s.charCodeAt(0) - t.charCodeAt(0), (i) => i.toString(16)];
        str = str.replace(/\?[a-z]/g, (m) => `\\x${hex(ord_diff(m[1], 'a') + 0xE1)}`);
        str = str.replace(/\?[A-Z]/g, (m) => `\\x${hex(ord_diff(m[1], 'A') + 0xC1)}`);
        str = str.replace(/\?[0-9]/g, (m) => ",/\\:. \n\t'-"[ord_diff(m[1], '0')]);
        str = str.replace(/\?\$(..)/g, (m, p) => `\\x${p.replace(/./g, (s) => hex(ord_diff(s, 'A')))}`);
        return { namekind: 'string', ...wide, length, crc, content: str };
    }
    parse_template_name() {
        const [names_prev_active, types_prev_active] = [this.names.active, this.types.active];
        [this.names.active, this.types.active] = [this.names.stored.length, this.types.stored.length];
        [this.names.stored[this.names.active], this.types.stored[this.types.active]] = [[], []];
        const name = this.parse_unqualified_name();
        const template_arguments = this.parse_list(() => this.parse_type());
        [this.names.active, this.types.active] = [names_prev_active, types_prev_active];
        return this.remember_name({ ...name, template_arguments });
    }
    remember_name(name) {
        this.names.stored[this.names.active].push(name);
        return name;
    }
    parse_parameter_list() {
        const params = [];
        while (this.input[this.index] !== '@' && this.input[this.index] !== 'Z') {
            const type = this.parse('parameter type')({
                '0-9': (n) => this.types.stored[this.types.active][n],
                default: () => {
                    const type = this.parse_type();
                    if (type.typekind !== 'basic')
                        this.types.stored[this.types.active].push(type);
                    return type;
                }
            });
            params.push(type);
        }
        const variadic = this.parse("end of function parameter list")({
            '@': () => ({}),
            'Z': () => ({ variadic: '...' }),
        });
        return { params, ...variadic };
    }
    parse_scope() {
        return this.parse_list(() => this.parse("scope")({
            '?': () => this.parse("scope", '?')({
                'A': () => this.parse_source_name(),
                '$': () => this.parse_template_name(),
                '?': () => this.parse_mangled_after_question_mark(),
                default: () => this.parse_integer(),
            }),
            default: () => this.parse_unqualified_name(),
        }));
    }
    parse_unqualified_name() {
        const name = this.parse("unqualified name")({
            '?': () => this.parse("unqualified name")({
                '$': () => this.parse_template_name(),
                default: () => this.parse_special_name(),
            }),
            '0-9': (n) => this.names.stored[this.names.active][n],
            default: () => this.remember_name({ namekind: 'identifier', spelling: this.parse_source_name() }),
        });
        if (name.namekind === 'string')
            throw `error: mangled name '?_C' is not expected to appear here\nsource string: ${this.dump()}`;
        return name;
    }
    parse_unqualified_name_or_mangled() {
        return this.parse("unqualified or mangled name")({
            '?': () => this.parse("unqualified or mangled name", '?')({
                '$': () => this.parse_template_name(),
                default: () => {
                    const mangled_name = this.parse_mangled_after_question_mark();
                    return this.parse("end of inner mangled name")({
                        '@': () => mangled_name
                    });
                }
            }),
            default: () => this.parse_unqualified_name()
        });
    }
    parse_special_name() {
        return this.parse("unqualified name")({
            'A': () => ({ namekind: 'operator', spelling: 'operator[]' }),
            'B': () => ({ namekind: 'special', specialname: 'conversion' }),
            'C': () => ({ namekind: 'operator', spelling: 'operator->' }),
            'D': () => ({ namekind: 'operator', spelling: 'operator*' }),
            'E': () => ({ namekind: 'operator', spelling: 'operator++' }),
            'F': () => ({ namekind: 'operator', spelling: 'operator--' }),
            'G': () => ({ namekind: 'operator', spelling: 'operator-' }),
            'H': () => ({ namekind: 'operator', spelling: 'operator+' }),
            'I': () => ({ namekind: 'operator', spelling: 'operator&' }),
            'J': () => ({ namekind: 'operator', spelling: 'operator->*' }),
            'K': () => ({ namekind: 'operator', spelling: 'operator/' }),
            'L': () => ({ namekind: 'operator', spelling: 'operator%' }),
            'M': () => ({ namekind: 'operator', spelling: 'operator< ' }),
            'N': () => ({ namekind: 'operator', spelling: 'operator<=' }),
            'O': () => ({ namekind: 'operator', spelling: 'operator> ' }),
            'P': () => ({ namekind: 'operator', spelling: 'operator>=' }),
            'Q': () => ({ namekind: 'operator', spelling: 'operator,' }),
            'R': () => ({ namekind: 'operator', spelling: 'operator()' }),
            'S': () => ({ namekind: 'operator', spelling: 'operator~' }),
            'T': () => ({ namekind: 'operator', spelling: 'operator^' }),
            'U': () => ({ namekind: 'operator', spelling: 'operator|' }),
            'V': () => ({ namekind: 'operator', spelling: 'operator&&' }),
            'W': () => ({ namekind: 'operator', spelling: 'operator||' }),
            'X': () => ({ namekind: 'operator', spelling: 'operator*=' }),
            'Y': () => ({ namekind: 'operator', spelling: 'operator+=' }),
            'Z': () => ({ namekind: 'operator', spelling: 'operator-=' }),
            '0': () => ({ namekind: 'special', specialname: 'constructor' }),
            '1': () => ({ namekind: 'special', specialname: 'destructor' }),
            '2': () => ({ namekind: 'operator', spelling: 'operator new' }),
            '3': () => ({ namekind: 'operator', spelling: 'operator delete' }),
            '4': () => ({ namekind: 'operator', spelling: 'operator=' }),
            '5': () => ({ namekind: 'operator', spelling: 'operator>>' }),
            '6': () => ({ namekind: 'operator', spelling: 'operator<<' }),
            '7': () => ({ namekind: 'operator', spelling: 'operator!' }),
            '8': () => ({ namekind: 'operator', spelling: 'operator==' }),
            '9': () => ({ namekind: 'operator', spelling: 'operator!=' }),
            '_': () => this.parse("unqualified name", '?_')({
                'A': () => ({ namekind: 'special', specialname: 'typeof' }),
                'B': () => ({ namekind: 'special', specialname: 'local static guard' }),
                'C': () => this.parse("string literal", '?_C')({
                    '@': () => this.parse("string literal", '?_C@')({
                        '_': () => this.parse_string_literal_name()
                    })
                }),
                'D': () => ({ namekind: 'special', spelling: '__vbaseDtor' }),
                'E': () => ({ namekind: 'special', spelling: '__vecDelDtor' }),
                'F': () => ({ namekind: 'special', spelling: '__dflt_ctor_closure' }),
                'G': () => ({ namekind: 'special', spelling: '__delDtor' }),
                'H': () => ({ namekind: 'special', spelling: '__vec_ctor' }),
                'I': () => ({ namekind: 'special', spelling: '__vec_dtor' }),
                'J': () => ({ namekind: 'special', spelling: '__vec_ctor_vb' }),
                'K': () => ({ namekind: 'special', specialname: 'virtual displacement map' }),
                'L': () => ({ namekind: 'special', spelling: '__ehvec_ctor' }),
                'M': () => ({ namekind: 'special', spelling: '__ehvec_dtor' }),
                'N': () => ({ namekind: 'special', spelling: '__ehvec_ctor_vb' }),
                'O': () => ({ namekind: 'special', spelling: '__copy_ctor_closure' }),
                'P': todo,
                'Q': todo,
                'R': () => this.parse("unqualified name", '?_R')({
                    '0': () => ({ namekind: 'special', specialname: 'RTTI Type Descriptor', type: this.parse_type() }),
                    '1': () => ({
                        namekind: 'special', specialname: 'RTTI Base Class Descriptor',
                        nvoffset: this.parse_integer(), vbptroffset: this.parse_integer(), vbtableoffset: this.parse_integer(),
                        flags: this.parse_integer(),
                    }),
                    '2': () => ({ namekind: 'special', specialname: 'RTTI Base Class Array' }),
                    '3': () => ({ namekind: 'special', specialname: 'RTTI Class Hierarchy Descriptor' }),
                    '4': () => ({ namekind: 'special', specialname: 'RTTI Complete Object Locator' }),
                }),
                'S': () => ({ namekind: 'special', specialname: 'local vftable' }),
                'T': () => ({ namekind: 'special', spelling: '__local_vftable_ctor_closure' }),
                'U': () => ({ namekind: 'operator', spelling: 'operator new[]' }),
                'V': () => ({ namekind: 'operator', spelling: 'operator delete[]' }),
                'W': todo,
                'X': todo,
                'Y': todo,
                'Z': todo,
                '0': () => ({ namekind: 'operator', spelling: 'operator/=' }),
                '1': () => ({ namekind: 'operator', spelling: 'operator%=' }),
                '2': () => ({ namekind: 'operator', spelling: 'operator>>=' }),
                '3': () => ({ namekind: 'operator', spelling: 'operator<<=' }),
                '4': () => ({ namekind: 'operator', spelling: 'operator&=' }),
                '5': () => ({ namekind: 'operator', spelling: 'operator|=' }),
                '6': () => ({ namekind: 'operator', spelling: 'operator^=' }),
                '7': () => ({ namekind: 'special', specialname: 'vftable' }),
                '8': () => ({ namekind: 'special', specialname: 'vbtable' }),
                '9': () => ({ namekind: 'special', specialname: 'vcall' }),
                '_': () => this.parse("unqualified name", '?__')({
                    'A': () => ({ namekind: 'special', spelling: '__man_vec_ctor' }),
                    'B': () => ({ namekind: 'special', spelling: '__man_vec_dtor' }),
                    'C': () => ({ namekind: 'special', spelling: '__ehvec_copy_ctor' }),
                    'D': () => ({ namekind: 'special', spelling: '__ehvec_copy_ctor_vb' }),
                    'E': () => ({ namekind: 'special', specialname: 'dynamic initializer', namefor: this.parse_unqualified_name_or_mangled() }),
                    'F': () => ({ namekind: 'special', specialname: 'dynamic atexit destructor', namefor: this.parse_unqualified_name_or_mangled() }),
                    'G': () => ({ namekind: 'special', spelling: '__vec_copy_ctor' }),
                    'H': () => ({ namekind: 'special', spelling: '__vec_copy_ctor_vb' }),
                    'I': () => ({ namekind: 'special', spelling: '__man_vec_copy_ctor' }),
                    'J': () => ({ namekind: 'special', specialname: 'local static thread guard' }),
                    'K': () => ({ namekind: 'literal', spelling: this.parse_source_name() }),
                    'L': () => ({ namekind: 'operator', spelling: 'operator co_await' }),
                    'M': () => ({ namekind: 'operator', spelling: 'operator<=>' }),
                }),
            }),
        });
    }
    parse_qualified_name() {
        return { ...this.parse_unqualified_name(), scope: this.parse_scope() };
    }
    parse_modifiers() {
        return this.parse("type qualifier")({
            'A': () => ({}),
            'B': () => ({ cv: 'const' }),
            'C': () => ({ cv: 'volatile' }),
            'D': () => ({ cv: 'const volatile' }),
            'E': () => ({ ptr64: '__ptr64', ...this.parse_modifiers() }),
            'F': () => ({ unaligned: '__unaligned', ...this.parse_modifiers() }),
            'G': () => ({ refqual: '&', ...this.parse_modifiers() }),
            'H': () => ({ refqual: '&&', ...this.parse_modifiers() }),
            'I': () => ({ restrict: '__restrict', ...this.parse_modifiers() }),
            'J': () => ({ format: 'huge', cv: 'const' }),
            'K': () => ({ format: 'huge', cv: 'volatile' }),
            'L': () => ({ format: 'huge', cv: 'const volatile' }),
            'M': todo,
            'N': todo,
            'O': todo,
            'P': todo,
            'Q': () => ({ member: 'member' }),
            'R': () => ({ cv: 'const', member: 'member' }),
            'S': () => ({ cv: 'volatile', member: 'member' }),
            'T': () => ({ cv: 'const volatile', member: 'member' }),
            'U': () => ({ format: 'far', member: 'member' }),
            'V': () => ({ format: 'far', cv: 'const', member: 'member' }),
            'W': () => ({ format: 'far', cv: 'volatile', member: 'member' }),
            'X': () => ({ format: 'far', cv: 'const volatile', member: 'member' }),
            'Y': () => ({ format: 'huge', member: 'member' }),
            'Z': () => ({ format: 'huge', cv: 'const', member: 'member' }),
            '0': () => ({ format: 'huge', cv: 'volatile', member: 'member' }),
            '1': () => ({ format: 'huge', cv: 'const volatile', member: 'member' }),
            '2': todo,
            '3': todo,
            '4': todo,
            '5': todo,
            '6': () => ({ function: 'function' }),
            '7': () => ({ format: 'far', function: 'function' }),
            '8': () => ({ member: 'member', function: 'function' }),
            '9': () => ({ format: 'far', member: 'member', function: 'function' }),
            '_': todo,
            '$': todo,
        });
    }
    parse_member_function_type() {
        return { ...this.parse_modifiers(), ...this.parse_function_type() };
    }
    parse_calling_convention() {
        return this.parse("calling convention")({
            'A': () => ({ calling_convention: '__cdecl' }),
            'B': () => ({ calling_convention: '__cdecl', export: '__export' }),
            'C': () => ({ calling_convention: '__pascal' }),
            'D': () => ({ calling_convention: '__pascal', export: '__export' }),
            'E': () => ({ calling_convention: '__thiscall' }),
            'F': () => ({ calling_convention: '__thiscall', export: '__export' }),
            'G': () => ({ calling_convention: '__stdcall' }),
            'H': () => ({ calling_convention: '__stdcall', export: '__export' }),
            'I': () => ({ calling_convention: '__fastcall' }),
            'J': () => ({ calling_convention: '__fastcall', export: '__export' }),
            'M': () => ({ calling_convention: '__clrcall' }),
            'O': () => ({ calling_convention: '__eabi' }),
            'Q': () => ({ calling_convention: '__vectorcall' }),
            'S': () => ({ calling_convention: '__swift_1' }),
            'U': () => ({ calling_convention: '__swift_2' }),
            'W': () => ({ calling_convention: '__regcall' }),
        });
    }
    parse_function_type() {
        let cc = this.parse_calling_convention();
        let return_type = this.parse("function return type")({
            '@': () => ({}),
            default: () => ({ return_type: this.parse_type() }),
        });
        let { params, variadic } = this.parse("function parameter list")({
            'X': () => ({ params: [] }),
            default: () => this.parse_parameter_list(),
        });
        let except = this.parse("noexcept specification")({
            'Z': () => ({}),
            '_': () => this.parse("noexcept specification", '_')({
                'E': () => ({ noexcept: 'noexcept' }),
            })
        });
        return { typekind: 'function', ...cc, ...return_type, params, variadic, ...except };
    }
    parse_array_type() {
        let dimension = this.parse_integer();
        let bounds = [...Array(Number(dimension))].map(() => this.parse_integer());
        let element_type = this.parse_type();
        return { typekind: 'array', dimension, bounds, element_type };
    }
    parse_full_type() {
        const modifiers = this.parse_modifiers();
        if (modifiers.member) {
            if (modifiers.function)
                return { ...modifiers, class_name: this.parse_qualified_name(), ...this.parse_member_function_type() };
            return { ...modifiers, class_name: this.parse_qualified_name(), ...this.parse_type() };
        }
        else {
            if (modifiers.function)
                return { ...modifiers, ...this.parse_function_type() };
            return { ...modifiers, ...this.parse_type() };
        }
    }
    parse_template_argument_or_extended_type() {
        return this.parse("type or template argument", '$')({
            'E': () => ({ typekind: 'template argument', argkind: 'entity', argref: 'reference', entity: this.parse_mangled() }),
            'M': () => ({ type: this.parse_type(), ...this.parse_template_argument_or_extended_type() }),
            'S': () => ({ typekind: 'template argument', argkind: 'empty non-type' }),
            '0': () => ({ typekind: 'template argument', argkind: 'integral', value: this.parse_integer() }),
            '1': () => ({ typekind: 'template argument', argkind: 'entity', entity: this.parse_mangled() }),
            '$': () => this.parse("type or template argument", '$$')({
                'A': () => this.parse_full_type(),
                'B': () => this.parse("type", '$$B')({
                    'Y': () => this.parse_array_type(),
                }),
                'C': () => ({ ...this.parse_modifiers(), ...this.parse_type() }),
                'Q': () => ({ typekind: 'reference', typename: '&&', pointee_type: this.parse_full_type() }),
                'R': () => ({ typekind: 'reference', typename: '&&', pointercv: 'volatile', pointee_type: this.parse_full_type() }),
                'T': () => ({ typekind: 'builtin', typename: 'std::nullptr_t' }),
                'V': () => ({ typekind: 'template argument', argkind: 'empty type' }),
                'Y': () => ({ typekind: 'template argument', argkind: 'alias', typename: this.parse_qualified_name() }),
                'Z': () => ({ typekind: 'template argument', argkind: 'pack separator' }),
            })
        });
    }
    parse_type() {
        return this.parse("type")({
            'A': () => ({ typekind: 'reference', typename: '&', pointee_type: this.parse_full_type() }),
            'B': () => ({ typekind: 'reference', typename: '&', pointercv: 'volatile', pointee_type: this.parse_full_type() }),
            'C': () => ({ typekind: 'basic', typename: 'signed char' }),
            'D': () => ({ typekind: 'basic', typename: 'char' }),
            'E': () => ({ typekind: 'basic', typename: 'unsigned char' }),
            'F': () => ({ typekind: 'basic', typename: 'short' }),
            'G': () => ({ typekind: 'basic', typename: 'unsigned short' }),
            'H': () => ({ typekind: 'basic', typename: 'int' }),
            'I': () => ({ typekind: 'basic', typename: 'unsigned int' }),
            'J': () => ({ typekind: 'basic', typename: 'long' }),
            'K': () => ({ typekind: 'basic', typename: 'long long' }),
            'L': error,
            'M': () => ({ typekind: 'basic', typename: 'float' }),
            'N': () => ({ typekind: 'basic', typename: 'double' }),
            'O': () => ({ typekind: 'basic', typename: 'long double' }),
            'P': () => ({ typekind: 'pointer', typename: '*', pointee_type: this.parse_full_type() }),
            'Q': () => ({ typekind: 'pointer', typename: '*', pointercv: 'const', pointee_type: this.parse_full_type() }),
            'R': () => ({ typekind: 'pointer', typename: '*', pointercv: 'volatile', pointee_type: this.parse_full_type() }),
            'S': () => ({ typekind: 'pointer', typename: '*', pointercv: 'const volatile', pointee_type: this.parse_full_type() }),
            'T': () => ({ typekind: 'union', typename: this.parse_qualified_name() }),
            'U': () => ({ typekind: 'struct', typename: this.parse_qualified_name() }),
            'V': () => ({ typekind: 'class', typename: this.parse_qualified_name() }),
            'W': () => ({
                typekind: 'enum', enumbase: this.parse("enum type", 'W')({
                    '0': () => 'char',
                    '1': () => 'unsigned char',
                    '2': () => 'short',
                    '3': () => 'unsigned short',
                    '4': () => 'int',
                    '5': () => 'unsigned int',
                    '6': () => 'long',
                    '7': () => 'unsigned long',
                }), typename: this.parse_qualified_name()
            }),
            'X': () => ({ typekind: 'basic', typename: 'void' }),
            'Y': () => this.parse_array_type(),
            'Z': error,
            '?': () => this.parse_full_type(),
            '_': () => this.parse("type", '_')({
                'A': error,
                'B': error,
                'C': error,
                'D': () => ({ typekind: 'builtin', typename: '__int8' }),
                'E': () => ({ typekind: 'builtin', typename: 'unsigned __int8' }),
                'F': () => ({ typekind: 'builtin', typename: '__int16' }),
                'G': () => ({ typekind: 'builtin', typename: 'unsigned __int16' }),
                'H': () => ({ typekind: 'builtin', typename: '__int32' }),
                'I': () => ({ typekind: 'builtin', typename: 'unsigned __int32' }),
                'J': () => ({ typekind: 'builtin', typename: '__int64' }),
                'K': () => ({ typekind: 'builtin', typename: 'unsigned __int64' }),
                'L': () => ({ typekind: 'builtin', typename: '__int128' }),
                'M': () => ({ typekind: 'builtin', typename: 'unsigned __int128' }),
                'N': () => ({ typekind: 'builtin', typename: 'bool' }),
                'O': todo,
                'P': error,
                'Q': () => ({ typekind: 'builtin', typename: 'char8_t' }),
                'R': error,
                'S': () => ({ typekind: 'builtin', typename: 'char16_t' }),
                'T': error,
                'U': () => ({ typekind: 'builtin', typename: 'char32_t' }),
                'V': error,
                'W': () => ({ typekind: 'builtin', typename: 'wchar_t' }),
                'X': error,
                'Y': error,
                'Z': error,
                '0': error,
                '1': error,
                '2': error,
                '3': error,
                '4': error,
                '5': error,
                '6': error,
                '7': error,
                '8': error,
                '9': error,
                '_': () => this.parse('type', '__')({
                    'R': () => ({ typekind: 'builtin', typename: 'unknown-type' }),
                }),
                '$': todo
            }),
            '$': () => this.parse_template_argument_or_extended_type(),
        });
    }
    parse_vtable_base() {
        return this.parse("base class name")({
            '@': () => ({}),
            default: () => ({ base: this.parse_qualified_name() }),
        });
    }
    parse_vcall_thunk_info() {
        return this.parse("vcall thunk info")({
            'A': () => ({}),
            default: todo,
        });
    }
    parse_vtordisp_kind() {
        return this.parse("vtordisp kind")({
            '0': () => ({ access: 'private' }),
            '1': () => ({ access: 'private', far: 'far' }),
            '2': () => ({ access: 'protected' }),
            '3': () => ({ access: 'protected', far: 'far' }),
            '4': () => ({ access: 'public' }),
            '5': () => ({ access: 'public', far: 'far' }),
        });
    }
    parse_extra_info() {
        return this.parse("entity info")({
            'A': () => ({ kind: 'function', access: 'private', ...this.parse_member_function_type() }),
            'B': () => ({ kind: 'function', access: 'private', far: 'far', ...this.parse_member_function_type() }),
            'C': () => ({ kind: 'function', access: 'private', specifier: 'static', ...this.parse_function_type() }),
            'D': () => ({ kind: 'function', access: 'private', specifier: 'static', far: 'far', ...this.parse_function_type() }),
            'E': () => ({ kind: 'function', access: 'private', specifier: 'virtual', ...this.parse_member_function_type() }),
            'F': () => ({ kind: 'function', access: 'private', specifier: 'virtual', far: 'far', ...this.parse_member_function_type() }),
            'G': () => ({ kind: 'thunk', access: 'private', adjustment: this.parse_integer(), ...this.parse_member_function_type() }),
            'H': () => ({ kind: 'thunk', access: 'private', far: 'far', adjustment: this.parse_integer(), ...this.parse_member_function_type() }),
            'I': () => ({ kind: 'function', access: 'protected', ...this.parse_member_function_type() }),
            'J': () => ({ kind: 'function', access: 'protected', far: 'far', ...this.parse_member_function_type() }),
            'K': () => ({ kind: 'function', access: 'protected', specifier: 'static', ...this.parse_function_type() }),
            'L': () => ({ kind: 'function', access: 'protected', specifier: 'static', far: 'far', ...this.parse_function_type() }),
            'M': () => ({ kind: 'function', access: 'protected', specifier: 'virtual', ...this.parse_member_function_type() }),
            'N': () => ({ kind: 'function', access: 'protected', specifier: 'virtual', far: 'far', ...this.parse_member_function_type() }),
            'O': () => ({ kind: 'thunk', access: 'protected', adjustment: this.parse_integer(), ...this.parse_member_function_type() }),
            'P': () => ({ kind: 'thunk', access: 'protected', far: 'far', adjustment: this.parse_integer(), ...this.parse_member_function_type() }),
            'Q': () => ({ kind: 'function', access: 'public', ...this.parse_member_function_type() }),
            'R': () => ({ kind: 'function', access: 'public', far: 'far', ...this.parse_member_function_type() }),
            'S': () => ({ kind: 'function', access: 'public', specifier: 'static', ...this.parse_function_type() }),
            'T': () => ({ kind: 'function', access: 'public', specifier: 'static', far: 'far', ...this.parse_function_type() }),
            'U': () => ({ kind: 'function', access: 'public', specifier: 'virtual', ...this.parse_member_function_type() }),
            'V': () => ({ kind: 'function', access: 'public', specifier: 'virtual', far: 'far', ...this.parse_member_function_type() }),
            'W': () => ({ kind: 'thunk', access: 'public', adjustment: this.parse_integer(), ...this.parse_member_function_type() }),
            'X': () => ({ kind: 'thunk', access: 'public', far: 'far', adjustment: this.parse_integer(), ...this.parse_member_function_type() }),
            'Y': () => ({ kind: 'function', ...this.parse_function_type() }),
            'Z': () => ({ kind: 'function', far: 'far', ...this.parse_function_type() }),
            '0': () => ({ kind: 'variable', access: 'private', specifier: 'static', ...this.parse_type(), ...this.parse_modifiers() }),
            '1': () => ({ kind: 'variable', access: 'protected', specifier: 'static', ...this.parse_type(), ...this.parse_modifiers() }),
            '2': () => ({ kind: 'variable', access: 'public', specifier: 'static', ...this.parse_type(), ...this.parse_modifiers() }),
            '3': () => ({ kind: 'variable', ...this.parse_type(), ...this.parse_modifiers() }),
            '4': () => ({ kind: 'variable', specifier: 'static', ...this.parse_type(), ...this.parse_modifiers() }),
            '5': todo,
            '6': () => ({ kind: 'special', ...this.parse_modifiers(), base: this.parse_vtable_base() }),
            '7': () => ({ kind: 'special', ...this.parse_modifiers(), base: this.parse_vtable_base() }),
            '8': () => ({ kind: 'special' }),
            '9': () => ({ kind: 'function' }),
            '_': todo,
            '$': () => this.parse("entity info", '$')({
                'B': () => ({ kind: 'thunk', callindex: this.parse_integer(), ...this.parse_vcall_thunk_info(), ...this.parse_calling_convention() }),
                'R': () => ({
                    kind: 'thunk', ...this.parse_vtordisp_kind(),
                    vbptrdisp: this.parse_integer(), vbindex: this.parse_integer(), vtordisp: this.parse_integer(), adjustment: this.parse_integer(),
                    ...this.parse_member_function_type(),
                }),
                default: () => ({
                    kind: 'thunk', ...this.parse_vtordisp_kind(),
                    vtordisp: this.parse_integer(), adjustment: this.parse_integer(),
                    ...this.parse_member_function_type()
                }),
            }),
        });
    }
    parse_mangled_after_question_mark() {
        const name = this.parse("unqualified name")({
            '?': () => this.parse("unqualified name")({
                '$': () => this.parse_template_name(),
                default: () => this.parse_special_name(),
            }),
            default: () => this.parse_unqualified_name(),
        });
        if (name.namekind === 'string')
            return name;
        return { ...name, scope: this.parse_scope(), ...this.parse_extra_info() };
    }
    parse_mangled() {
        return this.parse("mangled name")({
            '?': () => this.parse_mangled_after_question_mark(),
            default: error,
        });
    }
}
let filter_join = (sep) => (arr) => arr.filter(x => x).join(sep);
function print_unqualified_name(ast) {
    function print_optional_template_arguments(ast) {
        return ast.template_arguments ? `<${filter_join(', ')(ast.template_arguments.map(t => print_type(t).join('')))}>` : '';
    }
    switch (ast.namekind) {
        case 'identifier':
        case 'operator':
            return ast.spelling + print_optional_template_arguments(ast);
        case 'literal':
            return 'operator""' + ast.spelling + print_optional_template_arguments(ast);
        case 'special':
            const translate_special = {
                '__vbaseDtor': 'vbase destructor',
                '__vecDelDtor': 'vector deleting destructor',
                '__dflt_ctor_closure': 'default constructor closure',
                '__delDtor': 'scalar deleting destructor',
                '__vec_ctor': 'vector constructor iterator',
                '__vec_dtor': 'vector destructor iterator',
                '__vec_ctor_vb': 'vector vbase constructor iterator',
                '__ehvec_ctor': 'eh vector constructor iterator',
                '__ehvec_dtor': 'eh vector destructor iterator',
                '__ehvec_ctor_vb': 'eh vector vbase constructor iterator',
                '__copy_ctor_closure': 'copy constructor closure',
                '__local_vftable_ctor_closure': 'local vftable constructor closure',
                '__man_vec_ctor': 'managed vector constructor iterator',
                '__man_vec_dtor': 'managed vector destructor iterator',
                '__ehvec_copy_ctor': 'eh vector copy constructor iterator',
                '__ehvec_copy_ctor_vb': 'eh vector vbase copy constructor iterator',
                '__vec_copy_ctor': 'vector copy constructor iterator',
                '__vec_copy_ctor_vb': 'vector vbase copy constructor iterator',
                '__man_vec_copy_ctor': 'managed vector copy constructor iterator',
            };
            const specialname = translate_special['' + ast.spelling] || ast.specialname;
            if (ast.scope) {
                const enclosing_class_name = ast.scope[0];
                if (enclosing_class_name && enclosing_class_name.spelling) {
                    if (specialname === 'constructor')
                        return enclosing_class_name.spelling + print_optional_template_arguments(ast);
                    if (specialname === 'destructor')
                        return '~' + enclosing_class_name.spelling;
                }
            }
            const conversion_result_type = ast.return_type;
            if (conversion_result_type && specialname === 'conversion' && !ast.template_arguments)
                return 'operator ' + print_type(conversion_result_type).join('');
            if (ast.namefor) {
                const namefor = ast.namefor.scope ? print_qualified_name(ast.namefor) : print_unqualified_name(ast.namefor);
                return `'${specialname} for '${namefor}''`;
            }
            const base = ast.base;
            if (base)
                return `'${specialname} for '${print_qualified_name(base)}''`;
            return `'${specialname}'` + print_optional_template_arguments(ast);
    }
}
function print_qualified_name(ast) {
    const scope = [...ast.scope].reverse().map((scope) => {
        if (typeof scope === 'bigint')
            return `'${scope}'`;
        else if (typeof scope === 'string')
            return "'anonymous namespace'";
        else if (scope.kind)
            return `[${print_ast(scope)}]`;
        else
            return print_unqualified_name(scope);
    });
    return scope.concat(print_unqualified_name(ast)).join('::');
}
function print_type(ast) {
    switch (ast.typekind) {
        case 'basic':
        case 'builtin':
            const translate_builtin = {
                '__int64': 'long long',
                'unsigned __int64': 'unsigned long long',
            };
            const builtin_typename = translate_builtin[ast.typename] || ast.typename;
            return [filter_join(' ')([ast.cv, builtin_typename]), ''];
        case 'union':
        case 'struct':
        case 'class':
        case 'enum':
            return [filter_join(' ')([ast.cv, print_qualified_name(ast.typename)]), ''];
        case 'pointer':
        case 'reference':
            const [left, right] = print_type(ast.pointee_type);
            const class_name = ast.pointee_type.class_name;
            const typename = class_name ? print_qualified_name(class_name) + '::' + ast.typename : ast.typename;
            if (ast.pointee_type.typekind === 'array' || ast.pointee_type.typekind === 'function')
                return [left + ' (' + filter_join('')([typename, ast.pointercv]), ')' + right];
            else
                return [filter_join(' ')([left, typename, ast.pointercv]), right];
        case 'array':
            const [elem_left, elem_right] = print_type(ast.element_type);
            const boundstr = ast.bounds.map(bound => `[${bound || ''}]`).join('');
            return [elem_left, boundstr + elem_right];
        case 'function':
            const [ret_left = '', ret_right = ''] = ast.return_type ? print_type(ast.return_type) : [];
            const param_list = [...ast.params.map(t => print_type(t).join('')), ast.variadic];
            const params_and_quals = [`(${filter_join(', ')(param_list)})`, ast.cv, ast.refqual, ast.noexcept];
            if (ret_right)
                return ['auto', filter_join(' ')(params_and_quals) + ' -> ' + ret_left + ret_right];
            return [ret_left, filter_join(' ')(params_and_quals) + ret_right];
        case 'template argument':
            switch (ast.argkind) {
                case 'integral':
                    if (ast.type)
                        return ['(' + print_type(ast.type).join('') + ')' + ast.value.toString(), ''];
                    else
                        return [ast.value.toString(), ''];
                case 'empty non-type':
                case 'empty type':
                case 'pack separator':
                    return ['', ''];
                case 'alias':
                    return [print_qualified_name(ast.typename), ''];
                case 'entity':
                    if (ast.entity.namekind === 'string')
                        return ["'string'", ''];
                    else if (ast.type)
                        return [`(${print_type(ast.type).join('')})${ast.argref ? '' : '&'}${print_qualified_name(ast.entity)}`, ''];
                    else
                        return [(ast.argref ? '' : '&') + print_qualified_name(ast.entity), ''];
            }
            return ast;
    }
}
function print_ast(ast) {
    if (ast.namekind === 'string')
        return "'string'";
    const name = print_qualified_name(ast);
    if (!ast.typekind)
        return name;
    const [left, right] = print_type(ast);
    return filter_join(' ')([left, name]) + right;
}
export function demangle(input) {
    return print_ast(new Demangler(input).parse_mangled());
}
