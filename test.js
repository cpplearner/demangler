let { demangle } = require('./msvc-demangler');

[
    ["?f@@YADXZ", "char f()"],
    ["?f@@YADH@Z", "char f(int)"],
    ["??1publicA@@UEAA@XZ", "publicA::~publicA()"],
    ["??0publicA@@QEAA@XZ", "publicA::publicA()"],
    ["??_GpublicA@@UEAAPEAXI@Z", "void * publicA::'scalar deleting destructor'(unsigned int)"],
    ["??_DpublicA@@QEAAXXZ", "void publicA::'vbase destructor'()"],
    ["??_9publicA@@$B7AA", "publicA::`vcall'{8}'"],
    ["?f@@YAP8publicA@@EAAXXZXZ", "auto f() -> void (publicA::*)()"],
    ["??1protectedA@@MEAA@XZ", "protectedA::~protectedA()"],
    ["??_GprotectedA@@MEAAPEAXI@Z", "void * protectedA::'scalar deleting destructor'(unsigned int)"],
    ["??_DprotectedA@@IEAAXXZ", "void protectedA::'vbase destructor'()"],
    ["??1privateA@@EEAA@XZ", "privateA::~privateA()"],
    ["??_GprivateA@@EEAAPEAXI@Z", "void * privateA::'scalar deleting destructor'(unsigned int)"],
    ["??_DprivateA@@AEAAXXZ", "void privateA::'vbase destructor'()"],
].forEach(([mangled, expected]) => {
    try {
        let result = demangle(mangled);
        console.assert(result === expected,
            'Demangling "%s" produces unexpected result.\n\tExpected: "%s"\n\tActual: "%s"\n',
            mangled, expected, result);
    } catch (e) {
        console.log('Exception thrown when demangling "%s".\n\tExpected: "%s"\n\tMessage: """\n%s\n"""\n',
        mangled, expected, e);
    }
});
