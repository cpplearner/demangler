// OPTIONS: /clr

// MANGLED: ?main@@$$HYAHXZ
// DEMANGLED: int main()
int main() {}

// MANGLED: ?f1@@$$FYAXXZ
// DEMANGLED: void f1()
void f1() {}

// MANGLED: ?f2@@YMXP$AA__ZVInt32@System@@@Z
// DEMANGLED: void f2(System::Int32 ^)
void f2(int^) {}

// MANGLED: ?f3@@YAXA$CAH@Z
// DEMANGLED: void f3(int %)
void f3(int%) {}

// MANGLED: ?f4@@YMXP$01AH@Z
// DEMANGLED: void f4(cli::array<int>^)
void f4(array<int>^) {}

template<class> void f5() {}

void f6() {

// MANGLED: ??$f5@Q$CAH@@$$FYAXXZ
// DEMANGLED: void f5<int % const>()
f5<const interior_ptr<int>>();

// MANGLED: ??$f5@R$BAH@@$$FYAXXZ
// DEMANGLED: void f5<volatile cli::pin_ptr<int>>()
f5<pin_ptr<int>>();

// MANGLED: ??$f5@S$BAH@@$$FYAXXZ
// DEMANGLED: void f5<const volatile cli::pin_ptr<int>>()
f5<const pin_ptr<int>>();

// MANGLED: ??$f5@P$20$AH@@$$FYAXXZ
// DEMANGLED: void f5<cli::array<int, 32>>()
f5<array<int, 32>>();

// MANGLED: ??$f5@Q$20$AH@@$$FYAXXZ
// DEMANGLED: void f5<const cli::array<int, 32>>()
f5<const array<int, 32>>();

// MANGLED: ??$f5@Q$20AH@@$$FYAXXZ
// DEMANGLED: void f5<const cli::array<int, 32>^>()
f5<const array<int, 32>^>();

}
