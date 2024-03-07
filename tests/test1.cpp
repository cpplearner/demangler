// OPTIONS: /EHsc /std:c++latest
struct type1 {
    void operator[](int);
    operator void();
    operator decltype((int(*)())0)();
    type1* operator->();
    void operator*();
    void operator++();
    void operator--();
    void operator-();
    void operator+();
    void operator&();
    void operator->*(int);
    void operator/(int);
    void operator%(int);
    void operator<(int);
    void operator<=(int);
    void operator>(int);
    void operator>=(int);
    void operator,(int);
    void operator()();
    void operator~();
    void operator^(int);
    void operator|(int);
    void operator&&(int);
    void operator||(int);
    void operator*=(int);
    void operator+=(int);
    void operator-=(int);
    type1();
    ~type1();
    void* operator new(decltype(sizeof 0));
    void operator delete(void*);
    void operator=(int);
    void operator>>(int);
    void operator<<(int);
    void operator!();
    void operator==(int);
    void operator!=(int);
};

// MANGLED: ??Atype1@@QAEXH@Z
// DEMANGLED: void type1::operator[](int)
void type1::operator[](int) {}

// MANGLED: ??Btype1@@QAEXXZ
// DEMANGLED: void type1::operator void()
type1::operator void() {}

// MANGLED: ??Btype1@@QAEP6AHXZXZ
// DEMANGLED: auto type1::'conversion'() -> int (*)()
type1::operator decltype((int(*)())0)() {return 0;}

// MANGLED: ??Ctype1@@QAEPAU0@XZ
// DEMANGLED: type1 * type1::operator->()
type1* type1::operator->() {return 0;}

// MANGLED: ??Dtype1@@QAEXXZ
// DEMANGLED: void type1::operator*()
void type1::operator*() {}

// MANGLED: ??Etype1@@QAEXXZ
// DEMANGLED: void type1::operator++()
void type1::operator++() {}

// MANGLED: ??Ftype1@@QAEXXZ
// DEMANGLED: void type1::operator--()
void type1::operator--() {}

// MANGLED: ??Gtype1@@QAEXXZ
// DEMANGLED: void type1::operator-()
void type1::operator-() {}

// MANGLED: ??Htype1@@QAEXXZ
// DEMANGLED: void type1::operator+()
void type1::operator+() {}

// MANGLED: ??Itype1@@QAEXXZ
// DEMANGLED: void type1::operator&()
void type1::operator&() {}

// MANGLED: ??Jtype1@@QAEXH@Z
// DEMANGLED: void type1::operator->*(int)
void type1::operator->*(int) {}

// MANGLED: ??Ktype1@@QAEXH@Z
// DEMANGLED: void type1::operator/(int)
void type1::operator/(int) {}

// MANGLED: ??Ltype1@@QAEXH@Z
// DEMANGLED: void type1::operator%(int)
void type1::operator%(int) {}

// MANGLED: ??Mtype1@@QAEXH@Z
// DEMANGLED: void type1::operator< (int)
void type1::operator<(int) {}

// MANGLED: ??Ntype1@@QAEXH@Z
// DEMANGLED: void type1::operator<=(int)
void type1::operator<=(int) {}

// MANGLED: ??Otype1@@QAEXH@Z
// DEMANGLED: void type1::operator> (int)
void type1::operator>(int) {}

// MANGLED: ??Ptype1@@QAEXH@Z
// DEMANGLED: void type1::operator>=(int)
void type1::operator>=(int) {}

// MANGLED: ??Qtype1@@QAEXH@Z
// DEMANGLED: void type1::operator,(int)
void type1::operator,(int) {}

// MANGLED: ??Rtype1@@QAEXXZ
// DEMANGLED: void type1::operator()()
void type1::operator()() {}

// MANGLED: ??Stype1@@QAEXXZ
// DEMANGLED: void type1::operator~()
void type1::operator~() {}

// MANGLED: ??Ttype1@@QAEXH@Z
// DEMANGLED: void type1::operator^(int)
void type1::operator^(int) {}

// MANGLED: ??Utype1@@QAEXH@Z
// DEMANGLED: void type1::operator|(int)
void type1::operator|(int) {}

// MANGLED: ??Vtype1@@QAEXH@Z
// DEMANGLED: void type1::operator&&(int)
void type1::operator&&(int) {}

// MANGLED: ??Wtype1@@QAEXH@Z
// DEMANGLED: void type1::operator||(int)
void type1::operator||(int) {}

// MANGLED: ??Xtype1@@QAEXH@Z
// DEMANGLED: void type1::operator*=(int)
void type1::operator*=(int) {}

// MANGLED: ??Ytype1@@QAEXH@Z
// DEMANGLED: void type1::operator+=(int)
void type1::operator+=(int) {}

// MANGLED: ??Ztype1@@QAEXH@Z
// DEMANGLED: void type1::operator-=(int)
void type1::operator-=(int) {}

// MANGLED: ??0type1@@QAE@XZ
// DEMANGLED: type1::type1()
type1::type1() {}

// MANGLED: ??1type1@@QAE@XZ
// DEMANGLED: type1::~type1()
type1::~type1() {}

// MANGLED: ??2type1@@SAPAXI@Z
// DEMANGLED: void * type1::operator new(unsigned int)
void* type1::operator new(decltype(sizeof 0)) {return 0;}

// MANGLED: ??3type1@@SAXPAX@Z
// DEMANGLED: void type1::operator delete(void *)
void type1::operator delete(void*) {}

// MANGLED: ??4type1@@QAEXH@Z
// DEMANGLED: void type1::operator=(int)
void type1::operator=(int) {}

// MANGLED: ??5type1@@QAEXH@Z
// DEMANGLED: void type1::operator>>(int)
void type1::operator>>(int) {}

// MANGLED: ??6type1@@QAEXH@Z
// DEMANGLED: void type1::operator<<(int)
void type1::operator<<(int) {}

// MANGLED: ??7type1@@QAEXXZ
// DEMANGLED: void type1::operator!()
void type1::operator!() {}

// MANGLED: ??8type1@@QAEXH@Z
// DEMANGLED: void type1::operator==(int)
void type1::operator==(int) {}

// MANGLED: ??9type1@@QAEXH@Z
// DEMANGLED: void type1::operator!=(int)
void type1::operator!=(int) {}

struct type2 {
    type2(int = 42);
    type2(const type2&, int = 42);
    virtual ~type2();
    char x;
};
struct type3 : virtual type2 {
protected:
    virtual ~type3();
    char x[2];
};
struct type4 : virtual type2 {char x[3];};
struct type5 : type3, type4 {
private:
    friend void fn();
    ~type5();
};

// MANGLED: ??0<lambda_1>@?2??fn@@YAXXZ@QAE@AAY00$$CBUtype2@@@Z
// DEMANGLED: [void fn()]::'3'::<lambda_1>::<lambda_1>(const type2 (&)[1])
// MANGLED: ??1<lambda_1>@?2??fn@@YAXXZ@QAE@XZ
// DEMANGLED: [void fn()]::'3'::<lambda_1>::~<lambda_1>()
// MANGLED: ??0<lambda_2>@?3??fn@@YAXXZ@QAE@AAY00$$CBUtype5@@ABH@Z
// DEMANGLED: [void fn()]::'4'::<lambda_2>::<lambda_2>(const type5 (&)[1], const int &)
// MANGLED: ??1<lambda_2>@?3??fn@@YAXXZ@QAE@XZ
// DEMANGLED: [void fn()]::'4'::<lambda_2>::~<lambda_2>()
// MANGLED: ??1type2@@UAE@XZ
// DEMANGLED: type2::~type2()
// MANGLED: ??1type3@@MAE@XZ
// DEMANGLED: type3::~type3()
// MANGLED: ??1type5@@EAE@XZ
// DEMANGLED: type5::~type5()

// MANGLED: ??_Dtype3@@IAEXXZ
// DEMANGLED: void type3::'vbase destructor'()
// MANGLED: ??_Dtype5@@AAEXXZ
// DEMANGLED: void type5::'vbase destructor'()
// MANGLED: ??_Etype2@@UAEPAXI@Z
// DEMANGLED: void * type2::'vector deleting destructor'(unsigned int)
// MANGLED: ??_Ftype2@@QAEXXZ
// DEMANGLED: void type2::'default constructor closure'()
// MANGLED: ??_Gtype3@@MAEPAXI@Z
// DEMANGLED: void * type3::'scalar deleting destructor'(unsigned int)
// MANGLED: ??_L@YGXPAXIIP6EX0@Z1@Z
// DEMANGLED: void 'eh vector constructor iterator'(void *, unsigned int, unsigned int, void (*)(void *), void (*)(void *))
// MANGLED: ??_M@YGXPAXIIP6EX0@Z@Z
// DEMANGLED: void 'eh vector destructor iterator'(void *, unsigned int, unsigned int, void (*)(void *))
// MANGLED: ??_N@YGXPAXIIP6EX0@Z1@Z
// DEMANGLED: void 'eh vector vbase constructor iterator'(void *, unsigned int, unsigned int, void (*)(void *), void (*)(void *))
// MANGLED: ??_R0?AUtype3@@@8
// DEMANGLED: 'RTTI Type Descriptor'
// MANGLED: ??_R1A@A@3FA@type2@@8
// DEMANGLED: type2::'RTTI Base Class Descriptor'
// MANGLED: ??_R1A@?0A@EA@type2@@8
// DEMANGLED: type2::'RTTI Base Class Descriptor'
// MANGLED: ??_R1A@?0A@EA@type3@@8
// DEMANGLED: type3::'RTTI Base Class Descriptor'
// MANGLED: ??_R2type2@@8
// DEMANGLED: type2::'RTTI Base Class Array'
// MANGLED: ??_R2type3@@8
// DEMANGLED: type3::'RTTI Base Class Array'
// MANGLED: ??_R3type2@@8
// DEMANGLED: type2::'RTTI Class Hierarchy Descriptor'
// MANGLED: ??_R3type3@@8
// DEMANGLED: type3::'RTTI Class Hierarchy Descriptor'
// MANGLED: ??_Otype2@@QAEXAAU0@@Z
// DEMANGLED: void type2::'copy constructor closure'(type2 &)
// MANGLED: ??_7type3@@6B@
// DEMANGLED: type3::'vftable'
// MANGLED: ??__C@YGXPAX0IIP6EX00@ZP6EX0@Z@Z
// DEMANGLED: void 'eh vector copy constructor iterator'(void *, void *, unsigned int, unsigned int, void (*)(void *, void *), void (*)(void *))
// MANGLED: ??__D@YGXPAX0IIP6EX00@ZP6EX0@Z@Z
// DEMANGLED: void 'eh vector vbase copy constructor iterator'(void *, void *, unsigned int, unsigned int, void (*)(void *, void *), void (*)(void *))
// MANGLED: ?$S1@?1??fn@@YAXXZ@4IA
// DEMANGLED: unsigned int [void fn()]::'2'::$S1
void fn() {
    delete[] new type2[1];
    delete[] new type5[1];
    {
        type2 a1[1];
        [a1] {};
    }
    {
        type5 a2[1];
        int x{};
        [a2, x] {};
    }
    thread_local type1 a3;
}

type2::~type2() {}
type3::~type3() {}
type5::~type5() {}

struct type6 {
protected:
    void* operator new[](decltype(sizeof 0));
    void operator delete[](void*);
    void operator/=(int);
    void operator%=(int);
    void operator>>=(int);
    void operator<<=(int);
    void operator&=(int);
    void operator|=(int);
    void operator^=(int);
};

// MANGLED: ??_Utype6@@KAPAXI@Z
// DEMANGLED: void * type6::operator new[](unsigned int)
void* type6::operator new[](decltype(sizeof 0)) {return 0;}

// MANGLED: ??_Vtype6@@KAXPAX@Z
// DEMANGLED: void type6::operator delete[](void *)
void type6::operator delete[](void*) {}

// MANGLED: ??_0type6@@IAEXH@Z
// DEMANGLED: void type6::operator/=(int)
void type6::operator/=(int) {}

// MANGLED: ??_1type6@@IAEXH@Z
// DEMANGLED: void type6::operator%=(int)
void type6::operator%=(int) {}

// MANGLED: ??_2type6@@IAEXH@Z
// DEMANGLED: void type6::operator>>=(int)
void type6::operator>>=(int) {}

// MANGLED: ??_3type6@@IAEXH@Z
// DEMANGLED: void type6::operator<<=(int)
void type6::operator<<=(int) {}

// MANGLED: ??_4type6@@IAEXH@Z
// DEMANGLED: void type6::operator&=(int)
void type6::operator&=(int) {}

// MANGLED: ??_5type6@@IAEXH@Z
// DEMANGLED: void type6::operator|=(int)
void type6::operator|=(int) {}

// MANGLED: ??_6type6@@IAEXH@Z
// DEMANGLED: void type6::operator^=(int)
void type6::operator^=(int) {}

// MANGLED: ??_8type4@@7B@
// DEMANGLED: type4::'vbtable'
// MANGLED: ??_8type5@@7Btype3@@@
// DEMANGLED: type5::'vbtable'
// MANGLED: ??_8type5@@7Btype4@@@
// DEMANGLED: type5::'vbtable'
// MANGLED: ?var1@@3Utype1@@B
// DEMANGLED: const type1 var1
// MANGLED: ??__Evar1@@YAXXZ
// DEMANGLED: void 'dynamic initializer for 'var1''()
// MANGLED: ??__Fvar1@@YAXXZ
// DEMANGLED: void 'dynamic atexit destructor for 'var1''()
inline const type1 var1;

namespace ns1 {
// MANGLED: ?var2@ns1@@3Utype1@@A
// DEMANGLED: type1 ns1::var2
// MANGLED: ??__Evar2@ns1@@YAXXZ
// DEMANGLED: void ns1::'dynamic initializer for 'var2''()
// MANGLED: ??__Fvar2@ns1@@YAXXZ
// DEMANGLED: void ns1::'dynamic atexit destructor for 'var2''()
type1 var2;

template<class T> type1 var3;

// MANGLED: ??$var3@X@ns1@@3Utype1@@A
// DEMANGLED: type1 ns1::var3<void>
// MANGLED: ?var4@ns1@@3ABUtype1@@B
// DEMANGLED: const type1 & ns1::var4
// MANGLED: ??__E?$var3@X@ns1@@YAXXZ
// DEMANGLED: void ns1::'dynamic initializer for 'var3<void>''()
// MANGLED: ??__F?$var3@X@ns1@@YAXXZ
// DEMANGLED: void ns1::'dynamic atexit destructor for 'var3<void>''()
const type1& var4 = var3<void>;
}

class type7 {
public:
    static type1 var5;
    template<class T> static type1 var6;
};

// MANGLED: ?var5@type7@@2Utype1@@A
// DEMANGLED: type1 type7::var5
// MANGLED: ??__E?var5@type7@@2Utype1@@A@@YAXXZ
// DEMANGLED: void 'dynamic initializer for 'type7::var5''()
// MANGLED: ??__F?var5@type7@@2Utype1@@A@@YAXXZ
// DEMANGLED: void 'dynamic atexit destructor for 'type7::var5''()
type1 type7::var5;

// MANGLED: ??$var6@H@type7@@2Utype1@@A
// DEMANGLED: type1 type7::var6<int>
// MANGLED: ??__E??$var6@H@type7@@2Utype1@@A@type7@@YAXXZ
// DEMANGLED: void type7::'dynamic initializer for 'type7::var6<int>''()
// MANGLED: ??__F??$var6@H@type7@@2Utype1@@A@type7@@YAXXZ
// DEMANGLED: void type7::'dynamic atexit destructor for 'type7::var6<int>''()

template<class T> type1 type7::var6;
int x = (false ? ++type7::var6<int> : void(), 1);

// MANGLED: ??__K_a@@YAXPBD@Z
// DEMANGLED: void operator""_a(const char *)
void operator""_a(const char*) {}

// MANGLED: ??__L@YAXUtype1@@@Z
// DEMANGLED: void operator co_await(type1)
void operator co_await(type1) {}

// MANGLED: ??__M@YAXUtype1@@0@Z
// DEMANGLED: void operator<=>(type1, type1)
void operator<=>(type1, type1) {}

template<type7 arg> auto& f() { return arg; }

// MANGLED: ?var7@@3PBVtype7@@B
// DEMANGLED: const type7 * var7
// MANGLED: ??$f@$2Vtype7@@@@@YAAA_PXZ
// DEMANGLED: auto & f<type7{}>()
// MANGLED: ??__N2Vtype7@@@@
// DEMANGLED: type7{}
const auto* var7 = &f<type7{}>();

struct type8 {
    void f() &;
    void f() const&;
    void f() &&;
    void f() const&&;
    void g() __restrict;
    void g() __ptr64;
    void h() __restrict const& noexcept;
    int a;
    type7 b;
};

// MANGLED: ?$S2@@3ABUtype8@@B
// DEMANGLED: const type8 & $S2
const auto & [s1, s2] = type8{};

// MANGLED: ?f@type8@@QGAEXXZ
// DEMANGLED: void type8::f() &
void type8::f() & {}

// MANGLED: ?f@type8@@QGBEXXZ
// DEMANGLED: void type8::f() const &
void type8::f() const& {}

// MANGLED: ?f@type8@@QHAEXXZ
// DEMANGLED: void type8::f() &&
void type8::f() && {}

// MANGLED: ?g@type8@@QIAEXXZ
// DEMANGLED: void type8::g()
void type8::g() __restrict {}

// MANGLED: ?g@type8@@QAEXXZ
// DEMANGLED: void type8::g()
void type8::g() __ptr64 {}

// MANGLED: ?h@type8@@QIGBEXXZ
// DEMANGLED: void type8::h() const &
void type8::h() __restrict const& noexcept {}

// MANGLED: ?var8@@3PAY112HA
// DEMANGLED: int (* var8)[2][3]
int var8[1][2][3];

// MANGLED: ?var9@@3CA
// DEMANGLED: signed char var9
signed char var9;

// MANGLED: ?var10@@3DA
// DEMANGLED: char var10
char var10;

// MANGLED: ?var11@@3EA
// DEMANGLED: unsigned char var11
unsigned char var11;

// MANGLED: ?var12@@3FA
// DEMANGLED: short var12
short var12;

// MANGLED: ?var13@@3GA
// DEMANGLED: unsigned short var13
unsigned short var13;

// MANGLED: ?var14@@3HA
// DEMANGLED: int var14
int var14;

// MANGLED: ?var15@@3IA
// DEMANGLED: unsigned int var15
unsigned int var15;

// MANGLED: ?var16@@3JA
// DEMANGLED: long var16
long var16;

// MANGLED: ?var17@@3KA
// DEMANGLED: unsigned long var17
unsigned long var17;

// MANGLED: ?var18@@3MA
// DEMANGLED: float var18
float var18;

// MANGLED: ?var19@@3NA
// DEMANGLED: double var19
double var19;

// MANGLED: ?var20@@3OA
// DEMANGLED: long double var20
long double var20;

// MANGLED: ?var21@@3PAHA
// DEMANGLED: int * var21
int* var21;

// MANGLED: ?var22@@3QAHA
// DEMANGLED: int * const var22
extern int*const var22{};

// MANGLED: ?var23@@3RAHA
// DEMANGLED: int * volatile var23
int*volatile var23;

// MANGLED: ?var24@@3SAHA
// DEMANGLED: int * const volatile var24
extern int*const volatile var24{};

union type9 { int mem1; long mem2; };

// MANGLED: ?var25@@3Ttype9@@A
// DEMANGLED: type9 var25
type9 var25;

enum type10 {};

// MANGLED: ?var26@@3W4type10@@A
// DEMANGLED: type10 var26
type10 var26;

enum type11 : int {};

// MANGLED: ?var27@@3W4type11@@A
// DEMANGLED: type11 var27
type11 var27;

// MANGLED: ?var28@@3_JA
// DEMANGLED: long long var28
long long var28;

// MANGLED: ?var29@@3_KA
// DEMANGLED: unsigned long long var29
unsigned long long var29;

// MANGLED: ?var30@@3_NA
// DEMANGLED: bool var30
bool var30;

// MANGLED: ??$f1@X@@YA?A_PXZ
// DEMANGLED: auto f1<void>()
template<class T> auto f1() {return u8' ';}

// MANGLED: ?var31@@3_QA
// DEMANGLED: char8_t var31
char8_t var31 = f1<void>();

// MANGLED: ?var32@@3_SA
// DEMANGLED: char16_t var32
char16_t var32;

// MANGLED: ??$f2@X@@YA?A_TXZ
// DEMANGLED: decltype(auto) f2<void>()
template<class T> decltype(auto) f2() {return U' ';}

// MANGLED: ?var33@@3_UA
// DEMANGLED: char32_t var33
char32_t var33 = f2<void>();

// MANGLED: ?var34@@3_WA
// DEMANGLED: wchar_t var34
wchar_t var34;

// MANGLED: ?$S3@@3HA
// DEMANGLED: int $S3
// MANGLED: ?var35@@3$$QAHA
// DEMANGLED: int && var35
int&& var35 = 0;

// MANGLED: ?var36@@3$$TA
// DEMANGLED: std::nullptr_t var36
auto var36 = nullptr;

template<class...> void f3() {}

template<auto...> void f4() {}

template<int> void f5() {}

template<auto& ref> void f6() {}

template<auto v>
void f7() {
    f4<&v>();
    f6<v>();
}

template<float... Args> struct type12 {};

template<float... Args, float... Args2>
void f8(type12<Args...>, type12<Args2...>) {}

template<template<float>class> void f9() {}

template<float>
using type13 = type12<1>;

struct type14 { int datamem1; int memfn1() {} };

struct type15 { int datamem2; virtual int memfn2() {} };

struct type16 : type14, type15 {
    int memfn3() {}
};

struct type17 : virtual type14 {
    int datamem3;
    int memfn4() {}
};

template<class T> struct type18 { T t; };

type18<int[2][1]> var37;

void f10() {

// MANGLED: ??$f3@$$A6AHXZ@@YAXXZ
// DEMANGLED: void f3<int()>()
f3<int()>();

// MANGLED: ??$f3@$$A6AHX_E@@YAXXZ
// DEMANGLED: void f3<int() noexcept>()
f3<int() noexcept>();

// MANGLED: ??$f3@$$BY0A@H@@YAXXZ
// DEMANGLED: void f3<int[]>()
f3<int[]>();

// MANGLED: ??$f3@$$BY09H@@YAXXZ
// DEMANGLED: void f3<int[10]>()
f3<int[10]>();

// MANGLED: ??$f3@$$CBH@@YAXXZ
// DEMANGLED: void f3<const int>()
f3<const int>();

// MANGLED: ??$f3@$$BY09$$CBH@@YAXXZ
// DEMANGLED: void f3<const int[10]>()
f3<const int[10]>();

// MANGLED: ??$f3@$$V@@YAXXZ
// DEMANGLED: void f3<>()
f3<>();

// MANGLED: ??$f4@$M$$VS@@YAXXZ
// DEMANGLED: void f4<>()
f4<>();

// MANGLED: ??$f5@$0A@@@YAXXZ
// DEMANGLED: void f5<0>()
f5<0>();

// MANGLED: ??$f5@$0OJ@@@YAXXZ
// DEMANGLED: void f5<233>()
f5<233>();

// MANGLED: ??$f5@$0?0@@YAXXZ
// DEMANGLED: void f5<-1>()
f5<-1>();

// MANGLED: ??$f4@$MPBUtype8@@1??__N2Utype8@@H0A@2Vtype7@@@@@@@YAXXZ
// DEMANGLED: void f4<(const type8 *)&type8{(int)0, type7{}}>()
// MANGLED: ??$f6@$M$$CBUtype8@@1??__N2Utype8@@H0A@2Vtype7@@@@@@@YAXXZ
// DEMANGLED: void f6<(const type8)&type8{(int)0, type7{}}>()
// MANGLED: ??$f7@$MUtype8@@2U1@H0A@2Vtype7@@@@@@YAXXZ
// DEMANGLED: void f7<type8{(int)0, type7{}}>()
f7<type8{}>();

// MANGLED: ??$f8@$AA@$$Z$ALPMAAAAA@@@YAXU?$type12@$AA@@@U?$type12@$ALPMAAAAA@@@@Z
// DEMANGLED: void f8<0, -1.5>(type12<0>, type12<-1.5>)
f8(type12<0>{}, type12<-1.5>{});

// MANGLED: ??$f8@$S$$Z$S@@YAXU?$type12@$S@@0@Z
// DEMANGLED: void f8<>(type12<>, type12<>)
f8(type12<>{}, type12<>{});

// MANGLED: ??$f9@Utype12@@@@YAXXZ
// DEMANGLED: void f9<type12>()
f9<type12>();

// MANGLED: ??$f9@$$Ytype13@@@@YAXXZ
// DEMANGLED: void f9<type13>()
f9<type13>();

// MANGLED: ??$f4@$MPQtype14@@H0A@$MPQ1@H0?0@@YAXXZ
// DEMANGLED: void f4<(int type14::*)0, (int type14::*)-1>()
f4<&type14::datamem1, decltype(&type14::datamem1){nullptr}>();

// MANGLED: ??$f4@$MPQtype15@@H03$MPQ1@H0A@@@YAXXZ
// DEMANGLED: void f4<(int type15::*)4, (int type15::*)0>()
f4<&type15::datamem2, decltype(&type15::datamem2){nullptr}>();

// MANGLED: ??$f4@$MPQtype17@@HF3A@$MPQ1@HFA@?0@@YAXXZ
// DEMANGLED: void f4<(int type17::*)'member object pointer', (int type17::*)'member object pointer'>()
f4<&type17::datamem3, decltype(&type17::datamem3){nullptr}>();

// MANGLED: ??$f4@$MP8type14@@AEHXZ1?memfn1@1@QAEHXZ$MP81@AEHXZ0A@@@YAXXZ
// DEMANGLED: void f4<(int (type14::*)())&type14::memfn1, (int (type14::*)())0>()
f4<&type14::memfn1, decltype(&type14::memfn1){nullptr}>();

// MANGLED: ??$f4@$MP8type15@@AEHXZ1??_91@$BA@AE$MP81@AEHXZ0A@@@YAXXZ
// DEMANGLED: void f4<(int (type15::*)())&type15::'vcall', (int (type15::*)())0>()
f4<&type15::memfn2, decltype(&type15::memfn2){nullptr}>();

// MANGLED: ??$f4@$MP8type16@@AEHXZH?memfn3@1@QAEHXZA@$MP81@AEHXZHA@@@YAXXZ
// DEMANGLED: void f4<(int (type16::*)())'member function pointer', (int (type16::*)())'member function pointer'>()
f4<&type16::memfn3, decltype(&type16::memfn3){nullptr}>();

// MANGLED: ??$f4@$MP8type17@@AEHXZI?memfn4@1@QAEHXZA@A@$MP81@AEHXZIA@A@@@YAXXZ
// DEMANGLED: void f4<(int (type17::*)())'member function pointer', (int (type17::*)())'member function pointer'>()
f4<&type17::memfn4, decltype(&type17::memfn4){nullptr}>();

// MANGLED: ??$f4@$MU?$type18@PQtype15@@H@@2U1@PQtype15@@H82@datamem2@@@@@YAXXZ
// DEMANGLED: void f4<type18<int type15::*>{(int type15::*)&type15::datamem2}>()
f4<type18{&type15::datamem2}>();

// MANGLED: ??$f4@$MU?$type18@PQtype17@@H@@2U1@PQtype17@@HF3A@@@@YAXXZ
// DEMANGLED: void f4<type18<int type17::*>{(int type17::*)'member object pointer'}>()
f4<type18{&type17::datamem3}>();

// MANGLED: ??$f4@$MU?$type18@PQtype1@@H@@2U1@PQtype1@@HN@@@YAXXZ
// DEMANGLED: void f4<type18<int type1::*>{(int type1::*)nullptr}>()
f4<type18<int type1::*>{nullptr}>();

// MANGLED: ??$f4@$MU?$type18@P8type15@@AEHXZ@@2U1@P8type15@@AEHXZE??_92@$BA@AE@@@YAXXZ
// DEMANGLED: void f4<type18<int (type15::*)()>{(int (type15::*)())type15::'vcall'}>()
f4<type18{&type15::memfn2}>();

// MANGLED: ??$f4@$MU?$type18@P8type17@@AEHXZ@@2U1@P8type17@@AEHXZE?memfn4@2@QAEHXZ@@@YAXXZ
// DEMANGLED: void f4<type18<int (type17::*)()>{(int (type17::*)())type17::memfn4}>()
f4<type18{&type17::memfn4}>();

// MANGLED: ??$f4@$MU?$type18@$$BY110H@@2U1@3$$BY00H3H00@@@3H0A@@@@@@@@YAXXZ
// DEMANGLED: void f4<type18<int[2][1]>{(int[][1]){(int[]){1}, (int[]){0}}}>()
f4<type18<int[2][1]>{1}>();

// MANGLED: ??$f4@$MU?$type18@PBD@@2U1@PBD4??_C@_03GBBIHDEJ@foo@@@@@YAXXZ
// DEMANGLED: void f4<type18<const char *>{(const char *)'string'}>()
f4<type18{"foo"}>();

// MANGLED: ??$f4@$MU?$type18@PAH@@2U1@PAH56E?var25@@3Ttype9@@Amem1@@@@@@YAXXZ
// DEMANGLED: void f4<type18<int *>{(int *)&var25.mem1}>()
f4<type18{&var25.mem1}>();

// MANGLED: ??$f4@$MPAY110H61?var37@@3U?$type18@$$BY110H@@At@@@@YAXXZ
// DEMANGLED: void f4<(int (*)[2][1])&var37.t>()
f4<&var37.t>();

// MANGLED: ??$f4@$MPAY00HC61?var37@@3U?$type18@$$BY110H@@At@@00@@@YAXXZ
// DEMANGLED: void f4<(int (*)[1])&var37.t[1]>()
f4<&var37.t[1]>();

// MANGLED: ??$f4@$MPAHCC61?var37@@3U?$type18@$$BY110H@@At@@00@0A@@@@YAXXZ
// DEMANGLED: void f4<(int *)&var37.t[1][0]>()
f4<&var37.t[1][0]>();

// MANGLED: ??$f4@$MU?$type18@Ttype9@@@@2U1@7Ttype9@@mem1@0CK@@@@@YAXXZ
// DEMANGLED: void f4<type18<type9>{type9{.mem1=42}}>()
f4<type18{type9{42}}>();

// MANGLED: ??$f4@$MU?$type18@Ttype9@@@@2U1@7Ttype9@@mem2@0CK@@@@@YAXXZ
// DEMANGLED: void f4<type18<type9>{type9{.mem2=42}}>()
f4<type18{type9{.mem2=42}}>();

union type19 { int a[2]; union { long b; }; };

// MANGLED: ??$f4@$MTtype19@?1??f10@@YAXXZ@7T1?1??2@YAXXZ@a@3H06@0A@@@@@@YAXXZ
// DEMANGLED: void f4<[void f10()]::'2'::type19{.a=(int[]){7, 0}}>()
f4<type19{.a={7}}>();

// MANGLED: ??$f4@$MTtype19@?1??f10@@YAXXZ@7T1?1??2@YAXXZ@<unnamed-tag>@7T<unnamed-tag>@1?1??2@YAXXZ@b@0?0@@@@YAXXZ
// DEMANGLED: void f4<[void f10()]::'2'::type19{.<unnamed-tag>=[void f10()]::'2'::type19::<unnamed-tag>{.b=-1}}>()
f4<type19{.b=-1}>();

}

void weird() {
// MANGLED: ??$f4@$MPAY00HC61?var37@@3U?$type18@$$BY110H@@At@@61?var25@@3Ttype9@@Amem1@@@@@YAXXZ
// DEMANGLED: void f4<(int (*)[1])&var37.t[&var25.mem1]>()
f4<&var37.t[var25.mem1]>();
}

extern "C" {
inline const void* f11() {
    static const type1 var38;
    static thread_local type1 var39;
    return &var38;
}

// MANGLED: ??__Fvar38@?1??f11@@9@YAXXZ
// DEMANGLED: void [f11]::'2'::'dynamic atexit destructor for 'var38''()
// MANGLED: ?var38@?1??f11@@9@4Utype1@@B
// DEMANGLED: const type1 [f11]::'2'::var38
// MANGLED: ?$TSS0@?1??f11@@9@4HA
// DEMANGLED: int [f11]::'2'::$TSS0
// MANGLED: ?var39@?1??f11@@9@4Utype1@@A
// DEMANGLED: type1 [f11]::'2'::var39
// MANGLED: ??__J?1??f11@@9@51
// DEMANGLED: [f11]::'2'::'local static thread guard'
auto var40 = &f11;

}

// MANGLED: ?var41@@3PM0HM0
// DEMANGLED: int * var41
int __based(void)* var41;
// MANGLED: ?var42@@3PN2var21@@HN21@
// DEMANGLED: const int * var42
const int __based(var21)* var42;

namespace ns1::ns2 {
namespace {
struct type20 {};
void f12(type20) {}
template<class T> void f13(T) {}
}

// MANGLED: ?f12@?A0xc2db2ee5@ns2@ns1@@YAXUtype20@123@@Z
// DEMANGLED: void ns1::ns2::'anonymous namespace'::f12(ns1::ns2::'anonymous namespace'::type20)
// MANGLED: ??$f13@Utype20@?A0xc2db2ee5@ns2@ns1@@@?A0xc2db2ee5@ns2@ns1@@YAXUtype20@012@@Z
// DEMANGLED: void ns1::ns2::'anonymous namespace'::f13<ns1::ns2::'anonymous namespace'::type20>(ns1::ns2::'anonymous namespace'::type20)
auto var43 = true ? f12 : f13<type20>;
}

struct type21 {
    void f14(this auto) {}
};

// MANGLED: ??$f14@Utype21@@@type21@@SAX_VU0@@Z
// DEMANGLED: void type21::f14<type21>(this type21)
template void type21::f14(this type21);
