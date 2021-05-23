struct type1 {
    type1();
    type1(const type1&);
    virtual ~type1();
};

struct type2 : virtual type1 {
    type2();
    type2(const type2&);
    ~type2() override;
};

void fn() {
    delete[] new type1[1];
    delete[] new type2[1];
    type1 a[10];
    [a] {};
    type2 b[10];
    [b] {};
}

// MANGLED: ??_H@YGXPAXIIP6EPAX0@Z@Z
// DEMANGLED: void 'vector constructor iterator'(void *, unsigned int, unsigned int, void * (*)(void *))
// MANGLED: ??_I@YGXPAXIIP6EX0@Z@Z
// DEMANGLED: void 'vector destructor iterator'(void *, unsigned int, unsigned int, void (*)(void *))
// MANGLED: ??_J@YGXPAXIIP6EPAX0@Z@Z
// DEMANGLED: void 'vector vbase constructor iterator'(void *, unsigned int, unsigned int, void * (*)(void *))
// MANGLED: ??__G@YGXPAX0IIP6EPAX00@Z@Z
// DEMANGLED: void 'vector copy constructor iterator'(void *, void *, unsigned int, unsigned int, void * (*)(void *, void *))
// MANGLED: ??__H@YGXPAX0IIP6EPAX00@Z@Z
// DEMANGLED: void 'vector vbase copy constructor iterator'(void *, void *, unsigned int, unsigned int, void * (*)(void *, void *))
