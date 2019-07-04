function demangle_to_ast(s, idx = 0) {
    return parse_mangled({ input: s, index: idx, names: { stored: [[]], active: 0 }, types: { stored: [[]], active: 0 } });
}
function info(data) {
    return `${data.input.slice(0, data.index)} | ${data.input[data.index]} | ${data.input.slice(data.index + 1)}`;
}
let error = () => { throw "error: cannot demangle"; };
let todo = () => { throw "sorry: unimplemented demangling"; };
function parse(data, context, prefix = '') {
    return (map) => {
        let c = data.input[data.index];
        function call(f) {
            if (data.index > data.input.length)
                throw `error: unexpected end of string when demangling ${context}\nsource string: ${info(data)}`;
            else if (f === error)
                throw `error: cannot demangle ${context} that starts with '${prefix}${c}'\nsource string: ${info(data)}`;
            else if (f === todo)
                throw `sorry: unimplemented ${context} demangling of '${prefix}${c}'\nsource string: ${info(data)}`;
            else
                return f();
        }
        if (map[c]) {
            data.index++;
            return call(map[c]);
        }
        return call(map.default || error);
    };
}
function parse_source_name(data) {
    const spelling = data.input.slice(data.index, data.input.indexOf('@', data.index));
    data.index += spelling.length + 1;
    return spelling;
}
function parse_number(data) {
    const sign = parse(data, "number")({
        '?': () => -1,
        default: () => 1,
    });
    if ('0' <= data.input[data.index] && data.input[data.index] <= '9') {
        const value = +data.input[data.index] + 1;
        data.index++;
        return sign * value;
    }
    const numstring = parse_source_name(data);
    return sign * +('0x0' + numstring.replace(/./g, (s) => 'ABCDEFGHIJKLMNOP'.indexOf(s).toString(16)));
}
function parse_string_literal_name(data) {
    const wide = parse(data, "string literal width")({
        '0': () => undefined,
        '1': () => 'wide',
    });
    let [length, crc, str] = [parse_number(data), parse_source_name(data), parse_source_name(data)];
    const [ord_diff, hex] = [(s, t) => s.charCodeAt(0) - t.charCodeAt(0), (i) => i.toString(16)];
    str = str.replace(/\?[a-z]/g, (m) => `\\x${hex(ord_diff(m[1], 'a') + 0xE1)}`);
    str = str.replace(/\?[A-Z]/g, (m) => `\\x${hex(ord_diff(m[1], 'A') + 0xC1)}`);
    str = str.replace(/\?[0-9]/g, (m) => ",/\\:. \n\t'-"[ord_diff(m[1], '0')]);
    str = str.replace(/\?\$(..)/g, (m, p) => `\\x${p.replace(/./g, (s) => hex(ord_diff(s, 'A')))}`);
    return { namekind: 'string', wide, length, crc, content: str };
}
function parse_template_name(data) {
    const [names_prev_active, types_prev_active] = [data.names.active, data.types.active];
    [data.names.active, data.types.active] = [data.names.stored.length, data.types.stored.length];
    [data.names.stored[data.names.active], data.types.stored[data.types.active]] = [[], []];
    const name = parse_unqualified_name(data);
    const template_arguments = [];
    while (data.input[data.index] !== '@')
        template_arguments.push(parse_type(data));
    data.index++;
    [data.names.active, data.types.active] = [names_prev_active, types_prev_active];
    return { ...name, template_arguments };
}
function remember_name(data, name) {
    data.names.stored[data.names.active].push(name);
    return name;
}
function parse_parameter_list(data) {
    const params = [];
    while (data.input[data.index] !== '@' && data.input[data.index] !== 'Z') {
        const type = parse_type(data);
        params.push(type);
        if (type.typekind !== 'basic')
            data.types.stored[data.types.active].push(type);
    }
    const variadic = parse(data, "end of function parameter list")({
        '@': () => undefined,
        'Z': () => '...',
    });
    return { params, variadic };
}
function parse_scope(data) {
    const scopes = [];
    while (data.input[data.index] !== '@')
        scopes.push(parse(data, "scope")({
            '?': () => parse(data, "scope", '?')({
                '$': () => remember_name(data, parse_template_name(data)),
                '?': () => parse_mangled_after_question_mark(data),
                default: () => parse_number(data),
            }),
            default: () => parse_unqualified_name(data),
        }));
    data.index++;
    return scopes.reverse();
}
function parse_unqualified_name(data) {
    const name = parse(data, "unqualified name")({
        '?': () => parse(data, "unqualified name")({
            '$': () => remember_name(data, parse_template_name(data)),
            default: () => parse_special_name(data),
        }),
        '0': () => data.names.stored[data.names.active][0],
        '1': () => data.names.stored[data.names.active][1],
        '2': () => data.names.stored[data.names.active][2],
        '3': () => data.names.stored[data.names.active][3],
        '4': () => data.names.stored[data.names.active][4],
        '5': () => data.names.stored[data.names.active][5],
        '6': () => data.names.stored[data.names.active][6],
        '7': () => data.names.stored[data.names.active][7],
        '8': () => data.names.stored[data.names.active][8],
        '9': () => data.names.stored[data.names.active][9],
        default: () => remember_name(data, { namekind: 'identifier', spelling: parse_source_name(data) }),
    });
    if (name.namekind === 'string')
        throw `error: mangled name '?_C' is not expected to appear here\nsource string: ${info(data)}`;
    return name;
}
function parse_special_name(data) {
    return parse(data, "unqualified name")({
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
        '_': () => parse(data, "unqualified name", '?_')({
            'A': () => ({ namekind: 'special', specialname: 'typeof' }),
            'B': () => ({ namekind: 'special', specialname: 'local static guard' }),
            'C': () => parse(data, "string literal", '?_C')({
                '@': () => parse(data, "string literal", '?_C@')({
                    '_': () => parse_string_literal_name(data)
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
            'R': () => parse(data, "unqualified name", '?_R')({
                '0': () => ({ namekind: 'special', specialname: 'RTTI Type Descriptor', type: parse_type(data) }),
                '1': () => ({
                    namekind: 'special', specialname: 'RTTI Base Class Descriptor',
                    nvoffset: parse_number(data), vbptroffset: parse_number(data), vbtableoffset: parse_number(data),
                    flags: parse_number(data),
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
            '_': () => parse(data, "unqualified name", '?__')({
                'A': () => ({ namekind: 'special', spelling: '__man_vec_ctor' }),
                'B': () => ({ namekind: 'special', spelling: '__man_vec_dtor' }),
                'C': () => ({ namekind: 'special', spelling: '__ehvec_copy_ctor' }),
                'D': () => ({ namekind: 'special', spelling: '__ehvec_copy_ctor_vb' }),
                'E': () => ({ namekind: 'special', specialname: 'dynamic initializer', namefor: parse_unqualified_name(data) }),
                'F': () => ({ namekind: 'special', specialname: 'dynamic atexit destructor', namefor: parse_unqualified_name(data) }),
                'G': () => ({ namekind: 'special', spelling: '__vec_copy_ctor' }),
                'H': () => ({ namekind: 'special', spelling: '__vec_copy_ctor_vb' }),
                'I': () => ({ namekind: 'special', spelling: '__man_vec_copy_ctor' }),
                'J': () => ({ namekind: 'special', specialname: 'local static thread guard' }),
                'K': () => ({ namekind: 'literal', spelling: parse_source_name(data) }),
                'L': () => ({ namekind: 'operator', spelling: 'operator co_await' }),
                'M': () => ({ namekind: 'operator', spelling: 'operator<=>' }),
            }),
        }),
    });
}
function parse_qualified_name(data) {
    return { ...parse_unqualified_name(data), scope: parse_scope(data) };
}
function parse_modifiers(data) {
    return parse(data, "type qualifier")({
        'A': () => ({}),
        'B': () => ({ cv: 'const' }),
        'C': () => ({ cv: 'volatile' }),
        'D': () => ({ cv: 'const volatile' }),
        'E': () => ({ ptr64: '__ptr64', ...parse_modifiers(data) }),
        'F': () => ({ unaligned: '__unaligned', ...parse_modifiers(data) }),
        'G': () => ({ refqual: '&', ...parse_modifiers(data) }),
        'H': () => ({ refqual: '&&', ...parse_modifiers(data) }),
        'I': () => ({ restrict: '__restrict', ...parse_modifiers(data) }),
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
function parse_modified_function_type(data) {
    return { ...parse_modifiers(data), ...parse_function_type(data) };
}
function parse_function_type(data) {
    let cc = parse(data, "calling convention")({
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
        'Q': () => ({ calling_convention: '__vectorcall' }),
        'W': () => ({ calling_convention: '__regcall' }),
    });
    let return_type = parse(data, "function return type")({
        '@': () => undefined,
        default: () => parse_type(data),
    });
    let { params, variadic } = parse(data, "function parameter")({
        'X': () => ({ params: [] }),
        default: () => parse_parameter_list(data),
    });
    let except = parse(data, "exception specification")({
        'Z': () => [],
    });
    return { typekind: 'function', ...cc, return_type, params, variadic, except };
}
function parse_array_type(data) {
    let dimension = parse_number(data);
    let bounds = [...Array(dimension)].map(() => parse_number(data));
    let element_type = parse_type(data);
    return { typekind: 'array', dimension, bounds, element_type };
}
function parse_full_type(data) {
    const modifiers = parse_modifiers(data);
    if (modifiers.member) {
        if (modifiers.function)
            return { ...modifiers, class_name: parse_qualified_name(data), ...parse_modified_function_type(data) };
        return { ...modifiers, class_name: parse_qualified_name(data), ...parse_type(data) };
    } else {
        if (modifiers.function)
            return { ...modifiers, ...parse_function_type(data) };
        return { ...modifiers, ...parse_type(data) };
    }
}
function parse_type_or_template_argument(data) {
    return parse(data, "type or template argument", '$')({
        'M': () => ({ type: parse_type(data), ...parse_type_or_template_argument(data) }),
        'S': () => ({ typekind: 'template argument', argkind: 'empty non-type' }),
        '0': () => ({ typekind: 'template argument', argkind: 'integral', value: parse_number(data) }),
        '1': () => ({ typekind: 'template argument', argkind: 'entity', entity: parse_mangled(data) }),
        '$': () => parse(data, "type or template argument", '$$')({
            'A': () => parse_full_type(data),
            'B': () => parse(data, "type", '$$B')({
                'Y': () => parse_array_type(data)
            }),
            'C': () => ({ ...parse_modifiers(data), ...parse_type(data) }),
            'Q': () => ({ typekind: 'reference', typename: '&&', pointee_type: parse_full_type(data) }),
            'R': () => ({ typekind: 'reference', typename: '&&', pointercv: 'volatile', pointee_type: parse_full_type(data) }),
            'T': () => ({ typekind: 'builtin', typename: 'std::nullptr_t' }),
            'V': () => ({ typekind: 'template argument', argkind: 'empty type' }),
            'Y': () => ({ typekind: 'template argument', argkind: 'alias', typename: parse_qualified_name(data) }),
        })
    });
}
function parse_type(data) {
    return parse(data, "type")({
        'A': () => ({ typekind: 'reference', typename: '&', pointee_type: parse_full_type(data) }),
        'B': () => ({ typekind: 'reference', typename: '&', pointercv: 'volatile', pointee_type: parse_full_type(data) }),
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
        'P': () => ({ typekind: 'pointer', typename: '*', pointee_type: parse_full_type(data) }),
        'Q': () => ({ typekind: 'pointer', typename: '*', pointercv: 'const', pointee_type: parse_full_type(data) }),
        'R': () => ({ typekind: 'pointer', typename: '*', pointercv: 'volatile', pointee_type: parse_full_type(data) }),
        'S': () => ({ typekind: 'pointer', typename: '*', pointercv: 'const volatile', pointee_type: parse_full_type(data) }),
        'T': () => ({ typekind: 'union', typename: parse_qualified_name(data) }),
        'U': () => ({ typekind: 'struct', typename: parse_qualified_name(data) }),
        'V': () => ({ typekind: 'class', typename: parse_qualified_name(data) }),
        'W': () => ({
            typekind: 'enum', enumbase: parse(data, "enum type", 'W')({
                '0': () => 'char',
                '1': () => 'unsigned char',
                '2': () => 'short',
                '3': () => 'unsigned short',
                '4': () => 'int',
                '5': () => 'unsigned int',
                '6': () => 'long',
                '7': () => 'unsigned long',
            }), typename: parse_qualified_name(data)
        }),
        'X': () => ({ typekind: 'basic', typename: 'void' }),
        'Y': () => parse_array_type(data),
        'Z': error,
        '0': () => data.types.stored[data.types.active][0],
        '1': () => data.types.stored[data.types.active][1],
        '2': () => data.types.stored[data.types.active][2],
        '3': () => data.types.stored[data.types.active][3],
        '4': () => data.types.stored[data.types.active][4],
        '5': () => data.types.stored[data.types.active][5],
        '6': () => data.types.stored[data.types.active][6],
        '7': () => data.types.stored[data.types.active][7],
        '8': () => data.types.stored[data.types.active][8],
        '9': () => data.types.stored[data.types.active][9],
        '?': () => parse_full_type(data),
        '_': () => parse(data, "type", '_')({
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
            '_': () => parse(data, 'type', '__')({
                'R': () => ({ typekind: 'builtin', typename: 'unknown-type' }),
            }),
            '$': todo
        }),
        '$': () => parse_type_or_template_argument(data),
    });
}
function parse_vtable_base(data) {
    return parse(data, "class name")({
        '@': () => undefined,
        default: () => parse_qualified_name(data),
    });
}
function parse_extra_info(data) {
    return parse(data, "entity info")({
        'A': () => ({ kind: 'function', access: 'private', ...parse_modified_function_type(data) }),
        'B': () => ({ kind: 'function', access: 'private', far: 'far', ...parse_modified_function_type(data) }),
        'C': () => ({ kind: 'function', access: 'private', specifier: 'static', ...parse_function_type(data) }),
        'D': () => ({ kind: 'function', access: 'private', specifier: 'static', far: 'far', ...parse_function_type(data) }),
        'E': () => ({ kind: 'function', access: 'private', specifier: 'virtual', ...parse_modified_function_type(data) }),
        'F': () => ({ kind: 'function', access: 'private', specifier: 'virtual', far: 'far', ...parse_modified_function_type(data) }),
        'G': () => ({ kind: 'function', access: 'private', specifier: '__thunk', ...parse_modified_function_type(data) }),
        'H': () => ({ kind: 'function', access: 'private', specifier: '__thunk', far: 'far', ...parse_modified_function_type(data) }),
        'I': () => ({ kind: 'function', access: 'protected', ...parse_modified_function_type(data) }),
        'J': () => ({ kind: 'function', access: 'protected', far: 'far', ...parse_modified_function_type(data) }),
        'K': () => ({ kind: 'function', access: 'protected', specifier: 'static', ...parse_function_type(data) }),
        'L': () => ({ kind: 'function', access: 'protected', specifier: 'static', far: 'far', ...parse_function_type(data) }),
        'M': () => ({ kind: 'function', access: 'protected', specifier: 'virtual', ...parse_modified_function_type(data) }),
        'N': () => ({ kind: 'function', access: 'protected', specifier: 'virtual', far: 'far', ...parse_modified_function_type(data) }),
        'O': () => ({ kind: 'function', access: 'protected', specifier: '__thunk', ...parse_modified_function_type(data) }),
        'P': () => ({ kind: 'function', access: 'protected', specifier: '__thunk', far: 'far', ...parse_modified_function_type(data) }),
        'Q': () => ({ kind: 'function', access: 'public', ...parse_modified_function_type(data) }),
        'R': () => ({ kind: 'function', access: 'public', far: 'far', ...parse_modified_function_type(data) }),
        'S': () => ({ kind: 'function', access: 'public', specifier: 'static', ...parse_function_type(data) }),
        'T': () => ({ kind: 'function', access: 'public', specifier: 'static', far: 'far', ...parse_function_type(data) }),
        'U': () => ({ kind: 'function', access: 'public', specifier: 'virtual', ...parse_modified_function_type(data) }),
        'V': () => ({ kind: 'function', access: 'public', specifier: 'virtual', far: 'far', ...parse_modified_function_type(data) }),
        'W': () => ({ kind: 'function', access: 'public', specifier: '__thunk', ...parse_modified_function_type(data) }),
        'X': () => ({ kind: 'function', access: 'public', specifier: '__thunk', far: 'far', ...parse_modified_function_type(data) }),
        'Y': () => ({ kind: 'function', ...parse_function_type(data) }),
        'Z': () => ({ kind: 'function', far: 'far', ...parse_function_type(data) }),
        '0': () => ({ kind: 'variable', access: 'private', specifier: 'static', ...parse_type(data), ...parse_modifiers(data) }),
        '1': () => ({ kind: 'variable', access: 'protected', specifier: 'static', ...parse_type(data), ...parse_modifiers(data) }),
        '2': () => ({ kind: 'variable', access: 'public', specifier: 'static', ...parse_type(data), ...parse_modifiers(data) }),
        '3': () => ({ kind: 'variable', ...parse_type(data), ...parse_modifiers(data) }),
        '4': () => ({ kind: 'variable', specifier: 'static', ...parse_type(data), ...parse_modifiers(data) }),
        '5': todo,
        '6': () => ({ kind: 'special', ...parse_modifiers(data), base: parse_vtable_base(data) }),
        '7': () => ({ kind: 'special', ...parse_modifiers(data), base: parse_vtable_base(data) }),
        '8': () => ({ kind: 'special' }),
        '9': () => ({ kind: 'function' }),
        '_': todo,
        '$': todo,
    });
}
function parse_mangled_after_question_mark(data) {
    const name = parse(data, "unqualified name")({
        '?': () => parse(data, "unqualified name")({
            '$': () => parse_template_name(data),
            default: () => parse_special_name(data),
        }),
        default: () => parse_unqualified_name(data),
    });
    if (name.namekind === 'string')
        return name;
    return { ...name, scope: parse_scope(data), ...parse_extra_info(data) };
}
function parse_mangled(data) {
    return parse(data, "mangled name")({
        '?': () => parse_mangled_after_question_mark(data),
        default: error,
    });
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
                const enclosing_class_name = ast.scope[ast.scope.length - 1];
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
            if (ast.namefor)
                return `'${specialname} for '${print_unqualified_name(ast.namefor)}''`;
            const base = ast.base;
            if (base)
                return `'${specialname} for '${print_qualified_name(base)}''`;
            return `'${specialname}'` + print_optional_template_arguments(ast);
    }
}
function print_qualified_name(ast) {
    const scope = ast.scope.map((scope) => {
        if (typeof scope === 'number')
            return `'${scope}'`;
        if (scope.namekind === 'string' || scope.kind)
            return print_ast(scope);
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
            const parameter_list = [...ast.params.map(t => print_type(t).join('')), ast.variadic];
            const parameters_and_qualifiers = [`(${filter_join(', ')(parameter_list)})`, ast.cv, ast.refqual];
            if (ret_right)
                return ['auto', filter_join(' ')(parameters_and_qualifiers) + ' -> ' + ret_left + ret_right];
            return [ret_left, filter_join(' ')(parameters_and_qualifiers) + ret_right];
        case 'template argument':
            switch (ast.argkind) {
                case 'integral':
                    if (ast.type)
                        return ['(' + print_type(ast.type).join('') + ')' + ast.value.toString(), ''];
                    else
                        return [ast.value.toString(), ''];
                case 'empty non-type':
                case 'empty type':
                    return ['', ''];
                case 'alias':
                    return [print_qualified_name(ast.typename), ''];
                case 'entity':
                    if (ast.entity.namekind === 'string')
                        return ["'string'", ''];
                    else if (ast.type)
                        return ['(' + print_type(ast.type).join('') + ')' + print_qualified_name(ast.entity), ''];
		    else
                        return [print_qualified_name(ast.entity), ''];
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
function demangle(input) {
    return print_ast(demangle_to_ast(input));
}
