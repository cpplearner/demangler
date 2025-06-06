// OPTIONS: /GF /Zc:threadSafeInit- /Zc:u8EscapeSequence

// MANGLED: ??_C@_07MINAMJIC@hello?4?6@
// DEMANGLED: 'string'
auto str1 = "hello.\n";

// MANGLED: ??_C@_1BA@OMDLLEGE@?$AAh?$AAe?$AAl?$AAl?$AAo?$AA?4?$AA?6@
// DEMANGLED: 'string'
auto str2 = L"hello.\n";

// MANGLED: ??_C@_08BKGFADIE@hello?4?6?$AB@
// DEMANGLED: 'string'
auto str3 = u8"hello.\n\u0001";

// MANGLED: ??_C@_1BC@HFCBFCGI@?$AAh?$AAe?$AAl?$AAl?$AAo?$AA?4?$AA?6?$AA?$AB@
// DEMANGLED: 'string'
auto str4 = u"hello.\n\u0001";

// MANGLED: ??_C@_2CE@HBHIHJLO@?$AA?$AA?$AAh?$AA?$AA?$AAe?$AA?$AA?$AAl?$AA?$AA?$AAl?$AA?$AA?$AAo?$AA?$AA?$AA?4?$AA?$AA?$AA?6@
// DEMANGLED: 'string'
auto str5 = U"hello.\n\u0001";

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
