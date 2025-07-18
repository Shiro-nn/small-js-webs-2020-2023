window.addEventListener('load', async() => {
    let ttlxt = '> ';
    document.title = ttlxt+'_';
    const _par = document.querySelector('txt');
    await sleep(1000);
    AddWord('f');
    await sleep(1000);
    AddWord('y');
    await sleep(1000);
    AddWord('d');
    await sleep(1000);
    AddWord('n');
    await sleep(1000);
    AddWord('e');
    await sleep(1000);
    AddWord('.');
    await sleep(1000);
    AddWord('d');
    await sleep(1000);
    AddWord('e');
    await sleep(1000);
    AddWord('v');
    await sleep(1000);
    document.title = ttlxt;
    function AddWord(w){_par.innerHTML+=w;ttlxt+=w;document.title=ttlxt+'_';};
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});