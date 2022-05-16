function move(stickIdSrc, stickIdDst) {
    sticks.get(stickIdSrc).click(null,null);
    sticks.get(stickIdDst).click(null,null);
}
function solve(n, src, aux, dst) {
    if (n==1) {
        move(src, dst);
        console.log(`Move ${n} from stick id ${src} to ${dst}`);
        return;
    }
    solve(n-1, src, dst, aux);
    move(src, dst);
    console.log(`Move ${n} from stick id ${src} to ${dst}`);
    solve(n-1, aux, src, dst);
}
solve(8, 0, 1, 2);
