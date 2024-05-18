export async function main(ns) {
  ns.disableLog('')
  // purchases hacknet servers to meet a minimum requirement
  // to get access to Netburners faction

  let maxNodes = 8;
  let maxSumLevel = 100;
  let maxNodeLevel = Math.ceil(maxLevel/maxNodes);

  // 8 servers
  // 100 levels
  let cntLevel=0;
  while (cntLevel < maxSumLevel){ 
    let wasKleinstePreis = Math.MAX_SAFE_INTEGER;
    let mode = 'nix';
    let node
    cntLevel = 0;

    // erst die 8 server kaufen dann level hochziehen
    if (ns.hacknet.numNodes() < maxNodes) {
      if (ns.getServerMoneyAvailable('home')>wasKleinstePreis) {ns.hacknet.purchaseNode()} else {await ns.sleep(1000)}
    }


    // nachschaun was ist die günstigste option

    //check next lowest level
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
      cntLevel += ns.hacknet.getNodeStats(i).level;
      if (ns.hacknet.getNodeStats(i).level<13 && wasKleinstePreis > ns.hacknet.getLevelUpgradeCost(i,1)){
        wasKleinstePreis = ns.hacknet.getLevelUpgradeCost(i,1);
        mode = 'level';
        node = 1;
      }
    }

    //check next node
    if (ns.hacknet.getPurchaseNodeCost() < wasKleinstePreis) {
        wasKleinstePreis = ns.hacknet.getPurchaseNodeCost();
        mode = 'node';
    }

    // etwas tun


    if (mode = 'node') {
      if (ns.getServerMoneyAvailable('home')>wasKleinstePreis) {ns.hacknet.purchaseNode()} else {await ns.sleep(1000)}
    }
    if (mode = 'level') {
      if (ns.getServerMoneyAvailable('home')>wasKleinstePreis) {ns.hacknet.upgradeLevel(node,1)} else {await ns.sleep(1000)}
    } 

    // warten
    await ns.sleep(1000);
  }

}