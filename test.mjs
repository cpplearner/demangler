import { demangle } from './msvc-demangler.mjs';
import { readdir, readFile } from 'fs/promises';

async function read_testcase(filename) {
    const MANGLED_PREFIX = '// MANGLED: ';
    const DEMANGLED_PREFIX = '// DEMANGLED: ';

    const testcases = [];
    let mangled = '';

    const text = await readFile(filename, { encoding: 'ascii' });
    const lines = text.split('\n');
    for (const line of lines) {
        if (line.startsWith(MANGLED_PREFIX)) {
            mangled = line.replace(MANGLED_PREFIX, '').trim();
        }
        if (line.startsWith(DEMANGLED_PREFIX)) {
            const demangled = line.replace(DEMANGLED_PREFIX, '').trim();
            testcases.push([mangled, demangled]);
        }
    }
    return testcases;
}

async function get_all_testcases() {
    const old_testcase = [
        ["?f@@YADXZ", "char f()"],
        ["?f@@YADH@Z", "char f(int)"],
        ["?f@@YA?A_PXZ", "auto f()"],
        ["?f@@YA?A_TXZ", "decltype(auto) f()"],
        ["?f@@YAAB_PXZ", "const auto & f()"],
        ["?f@@YAXPAU?$A@H@@PAU?$A@J@@PAU1foo@@PAU23@@Z", "void f(A<int> *, A<long> *, foo::A<int> *, foo::A<long> *)"],
        ["??_DY@@QAEXXZ", "void Y::'vbase destructor'()"],
        ["??_EY@@QAEPAXI@Z", "void * Y::'vector deleting destructor'(unsigned int)"],
        ["??_EX@@UAAPAXI@Z", "void * X::'vector deleting destructor'(unsigned int)"],
        ["??_EX@@UEAAPEAXI@Z", "void * X::'vector deleting destructor'(unsigned int)"],
        ["??_FY@@QAEXXZ", "void Y::'default constructor closure'()"],
        ["??_GY@@QAEPAXI@Z", "void * Y::'scalar deleting destructor'(unsigned int)"],
        ["??_OY@@QAEXAAU0@@Z", "void Y::'copy constructor closure'(Y &)"],
        ["??3@YAXPEAX_K@Z", "void operator delete(void *, unsigned long long)"],
        ["??_U@YAPEAX_K@Z", "void * operator new[](unsigned long long)"],
        ["??_V@YAXPEAX@Z", "void operator delete[](void *)"],
        ["??_V@YAXPEAX_K@Z", "void operator delete[](void *, unsigned long long)"],
        ["??1publicA@@UEAA@XZ", "publicA::~publicA()"],
        ["??0publicA@@QEAA@XZ", "publicA::publicA()"],
        ["??_GpublicA@@UEAAPEAXI@Z", "void * publicA::'scalar deleting destructor'(unsigned int)"],
        ["??_DpublicA@@QEAAXXZ", "void publicA::'vbase destructor'()"],
        ["??_9publicA@@$B7AA", "publicA::'vcall'"],
        ["?f@@YAP8publicA@@EAAXXZXZ", "auto f() -> void (publicA::*)()"],
        ["??1protectedA@@MEAA@XZ", "protectedA::~protectedA()"],
        ["??_GprotectedA@@MEAAPEAXI@Z", "void * protectedA::'scalar deleting destructor'(unsigned int)"],
        ["??_DprotectedA@@IEAAXXZ", "void protectedA::'vbase destructor'()"],
        ["??1privateA@@EEAA@XZ", "privateA::~privateA()"],
        ["??_GprivateA@@EEAAPEAXI@Z", "void * privateA::'scalar deleting destructor'(unsigned int)"],
        ["??_DprivateA@@AEAAXXZ", "void privateA::'vbase destructor'()"],
        ["??_EB@@$4PPPPPPPM@A@AEPAXI@Z", "void * B::'vector deleting destructor'(unsigned int)"],
        ["?f@B@@$4PPPPPPPM@A@AEXXZ", "void B::f()"],
        ["??_EC@@$0PPPPPPPM@A@AEPAXI@Z", "void * C::'vector deleting destructor'(unsigned int)"],
        ["?f@B@@$R477PPPPPPPM@7AEXXZ", "void B::f()"],
        ["??__Ex@@YAXXZ", "void 'dynamic initializer for 'x''()"],
        ["??__Fa@N@@YAXXZ", "void N::'dynamic atexit destructor for 'a''()"],
        ["?x@?1??f@@YAXH@Z@4HA", "int [void f(int)]::'2'::x"],
        ["?$TSS0@?1??f@@YAXH@Z@4HA", "int [void f(int)]::'2'::$TSS0"],
        ["?x@?L@??f@@YAXH@Z@4HA", "int [void f(int)]::'11'::x"],
        ["?x@?A0xc5095fac@@3HA", "int 'anonymous namespace'::x"],
        ["??$f@$0A@@@YAHXZ", "int f<0>()"],
        ["??$f@$MJ0?0@@YAHXZ", "int f<(long)-1>()"],
        ["??$f@$M_J0CLNMFEFNGLELIH@@@YAHXZ", "int f<(long long)12345678901234567>()"],
        ["??$f@$M_J0CLNMFEFNGLELII@@@YAHXZ", "int f<(long long)12345678901234568>()"],
        ["??$f@$F3A@@@YAHXZ", "int f<'member object pointer'>()"],
        ["??$f@$MPQA@@HG3A@A@@@YAHXZ", "int f<(int A::*)'member object pointer'>()"],
        ["??$f@$MP8C@@AEXXZH??_91@$BA@AEA@@@YAHXZ", "int f<(void (C::*)())'member function pointer'>()"],
        ["??$f@$MP8C@@AEXXZI??_91@$BA@AEA@3@@YAHXZ", "int f<(void (C::*)())'member function pointer'>()"],
        ["??$f@$MP8C@@AEXXZJ??_91@$BA@AEA@A@7@@YAHXZ", "int f<(void (C::*)())'member function pointer'>()"],
        ["??$f@$AA@@@YAHXZ", "int f<0>()"],
        ["??$f@$BLPPAAAAAAAAAAAAA@@@YAHXZ", "int f<-1>()"],
        ["??$f@$AHPIAAAAA@@@YAHXZ", "int f<Infinity>()"],
        ["??$f@$APPMAAAAA@@@YAHXZ", "int f<NaN>()"],
        ["??$f@$2UA@@H0CK@@@@YAHXZ", "int f<A{(int)42}>()"],
        ["??$f@$2UA@@PAD0A@NBDPPAAAAAAAAAAAAA@@@@YAHXZ", "int f<A{(char *)0, (double)1}>()"],
        ["??$f@$2UC@@2UA@@H0A@@2UB@@NBA@@@@@YAHXZ", "int f<C{A{(int)0}, B{(double)0}}>()"],
        ["??$f@$MUA@@2U1@3H00@@@@@YAHXZ", "int f<A{(int[]){1}}>()"],
        ["??$f@$MUA@@2U1@3$$BY00H3H00@@@@@@@YAHXZ", "int f<A{(int[][1]){(int[]){1}}}>()"],
        ["??$f@$MUA@@2U1@3$$BY100H3$$BY00H3H00@@@@@@@@@YAHXZ", "int f<A{(int[][1][1]){(int[][1]){(int[]){1}}}}>()"],
        ["??$g@$M$$CBUA@@1??__N2UA@@H0CK@@@$$Z$$CBU1@@@YAHABUA@@@Z", "int g<(const A)&A{(int)42}, const A>(const A &)"],
        ["??$g@$MPBUA@@1??__N2UA@@H0CK@@@$$Z$$CBU1@@@YAHABUA@@@Z", "int g<(const A *)&A{(int)42}, const A>(const A &)"],
    ];
    const testfiles = await readdir('tests').then(files => files.filter(name => name.endsWith('.cpp')));

    return old_testcase.concat(...await Promise.all(testfiles.map(name => read_testcase('tests/' + name))));
}

get_all_testcases().then(testcases => {
    testcases.forEach(([mangled, expected]) => {
        try {
            let result = demangle(mangled);
            if (result !== expected) {
                process.exitCode = 1;
                console.error(`Fail: Demangling "${mangled}" produces unexpected result.`);
                console.error(`\tExpect: "${expected}"`);
                console.error(`\tActual: "${result}"`);
            }
        } catch (e) {
            process.exitCode = 1;
            console.error(`Fail: Exception thrown when demangling "${mangled}".`);
            console.error(`\tExpected: "${expected}"`);
            console.error(`\tMessage: """\n${e}\n"""`);
        }
    });
});
