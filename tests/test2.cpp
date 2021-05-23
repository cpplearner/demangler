// OPTIONS: /GF /Zc:threadSafeInit-

// MANGLED: ??_C@_07MINAMJIC@hello?4?6@
// DEMANGLED: 'string'
auto str = "hello.\n";

struct type1 {
    type1() {}
    ~type1() {}
};

extern "C" {
inline type1 f1() {
    static type1 var1;
    return var1;
}

// MANGLED: ??__Fvar1@?1??f1@@9@YAXXZ
// DEMANGLED: void [f1]::'2'::'dynamic atexit destructor for 'var1''()
// MANGLED: ?var1@?1??f1@@9@4Utype1@@A
// DEMANGLED: type1 [f1]::'2'::var1
// MANGLED: ??_B?1??f1@@9@51
// DEMANGLED: [f1]::'2'::'local static guard'
auto var2 = &f1;
}
