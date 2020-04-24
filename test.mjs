import { demangle } from './msvc-demangler.mjs';

[
    ["?f@@YADXZ", "char f()"],
    ["?f@@YADH@Z", "char f(int)"],
    ["?f@@YAXPAU?$A@H@@PAU?$A@J@@PAU1foo@@PAU23@@Z", "void f(A<int> *, A<long> *, foo::A<int> *, foo::A<long> *)"],
    ["??_DY@@QAEXXZ", "void Y::'vbase destructor'()"],
    ["??_EY@@QAEPAXI@Z", "void * Y::'vector deleting destructor'(unsigned int)"],
    ["??_EX@@UAAPAXI@Z", "void * X::'vector deleting destructor'(unsigned int)"],
    ["??_EX@@UEAAPEAXI@Z", "void * X::'vector deleting destructor'(unsigned int)"],
    ["??_FY@@QAEXXZ", "void Y::'default constructor closure'()"],
    ["??_GY@@QAEPAXI@Z", "void * Y::'scalar deleting destructor'(unsigned int)"],
    ["??_H@YGXPAXIIP6EPAX0@Z@Z", "void 'vector constructor iterator'(void *, unsigned int, unsigned int, void * (*)(void *))"],
    ["??_I@YGXPAXIIP6EX0@Z@Z", "void 'vector destructor iterator'(void *, unsigned int, unsigned int, void (*)(void *))"],
    ["??_J@YGXPAXIIP6EPAX0@Z@Z", "void 'vector vbase constructor iterator'(void *, unsigned int, unsigned int, void * (*)(void *))"],
    ["??_L@YGXPAXIIP6EX0@Z1@Z", "void 'eh vector constructor iterator'(void *, unsigned int, unsigned int, void (*)(void *), void (*)(void *))"],
    ["??_M@YGXPAXIIP6EX0@Z@Z", "void 'eh vector destructor iterator'(void *, unsigned int, unsigned int, void (*)(void *))"],
    ["??_N@YGXPAXIIP6EX0@Z1@Z", "void 'eh vector vbase constructor iterator'(void *, unsigned int, unsigned int, void (*)(void *), void (*)(void *))"],
    ["??_OY@@QAEXAAU0@@Z", "void Y::'copy constructor closure'(Y &)"],
    ["??__C@YGXPAX0IIP6EX00@ZP6EX0@Z@Z", "void 'eh vector copy constructor iterator'(void *, void *, unsigned int, unsigned int, void (*)(void *, void *), void (*)(void *))"],
    ["??__D@YGXPAX0IIP6EX00@ZP6EX0@Z@Z", "void 'eh vector vbase copy constructor iterator'(void *, void *, unsigned int, unsigned int, void (*)(void *, void *), void (*)(void *))"],
    ["??__G@YGXPAX0IIP6EPAX00@Z@Z", "void 'vector copy constructor iterator'(void *, void *, unsigned int, unsigned int, void * (*)(void *, void *))"],
    ["??__H@YGXPAX0IIP6EPAX00@Z@Z", "void 'vector vbase copy constructor iterator'(void *, void *, unsigned int, unsigned int, void * (*)(void *, void *))"],
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
    ["?x@?1??f@@YAXH@Z@4HA", "int [void f(int)]::'2'::x"],
    ["?$TSS0@?1??f@@YAXH@Z@4HA", "int [void f(int)]::'2'::$TSS0"],
    ["?x@?L@??f@@YAXH@Z@4HA", "int [void f(int)]::'11'::x"],
    ["?x@?A0xc5095fac@@3HA", "int 'anonymous namespace'::x"],
    ["??$f@$MJ0?0@@YAHXZ", "int f<(long)-1>()"],
    ["??$f@$MH0A@@@YAHXZ", "int f<(int)0>()"],
    ["??$f@$M_J0CLNMFEFNGLELIH@@@YAHXZ", "int f<(long long)12345678901234567>()"],
    ["??$f@$M_J0CLNMFEFNGLELII@@@YAHXZ", "int f<(long long)12345678901234568>()"],
    ["??$f@$$BY2120_J@@YAHXZ", "int f<long long[2][3][1]>()"],
    ["?f@@YAXX_E", "void f() noexcept"],
].forEach(([mangled, expected]) => {
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
