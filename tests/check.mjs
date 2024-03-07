import { spawn } from 'child_process';
import { readFile } from 'fs/promises';
import { Demangler, demangle } from '../msvc-demangler.mjs';

async function read_input(filename) {
    const OPTIONS_PREFIX = '// OPTIONS: ';
    const MANGLED_PREFIX = '// MANGLED: ';
    const DEMANGLED_PREFIX = '// DEMANGLED: ';

    const options = [];
    const mangled = [];
    const demangled = [];
    const text = await readFile(filename, { encoding: 'ascii' });
    const lines = text.split('\n');
    for (const line of lines) {
        if (line.startsWith(OPTIONS_PREFIX)) {
            options.push(...line.replace(OPTIONS_PREFIX, '').trim().split(' '));
        }
        if (line.startsWith(MANGLED_PREFIX)) {
            mangled.push(line.replace(MANGLED_PREFIX, '').trim());
        }
        if (line.startsWith(DEMANGLED_PREFIX)) {
            demangled.push(line.replace(DEMANGLED_PREFIX, '').trim());
        }
    }
    if (mangled.length !== demangled.length) {
        console.error('lengths are unequal: %s vs %s', mangled.length, demangled.length);
    }
    return { options, mangled, demangled };
}

async function test(filename, outname) {
    const { options, mangled, demangled } = await read_input(filename);

    const ls = spawn('cl.exe', [...options, '/nologo', '/Fa'+outname, '/c', '/FoNUL', filename]);

    let stdout = '';

    ls.stdout.on('data', (chunk) => {
        stdout += chunk;
    });

    ls.on('close', async (code) => {
        if (code !== 0) {
            console.error(stdout);
        }

        const text = await readFile(outname, { encoding: 'ascii' });

        for (const mangled_name of mangled) {
            if (!text.includes(mangled_name)) {
                console.error('failed to find "%s" from asm file', mangled_name);
            }
        }
        for (let i = 0; i < mangled.length; ++i) {
            try {
                const s = demangle(mangled[i]);
                if (s !== demangled[i]) {
                    console.error('unexpected result');
                    console.error('expect: "%s"', demangled[i]);
                    console.error('actual: "%s"', s);
                    const d = new Demangler(mangled[i]);
                    console.dir(d.parse_mangled(), { depth: 10 });
                }
                const d = new Demangler(mangled[i]);
                d.parse_mangled();
                if (d.index !== mangled.length) {
                    d.dump();
                }
            } catch (e) {
                console.error(e);
            }
        }
    });
}

test('test1.cpp', 'test1.asm');
test('test2.cpp', 'test2.asm');
test('test3.cpp', 'test3.asm');
test('test4.cpp', 'test4.asm');
