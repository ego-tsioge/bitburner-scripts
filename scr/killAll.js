/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	let allServer = getServers();
	for (let server of allServer) {
		if (server !== ns.getHostname()) {
			ns.killall(server, true);
		}
	}
	ns.killall(ns.getHostname());


	function getServers() {
		let visited = [];
		let speicher = ['home'];

		//solange noch was im speicher liegt
		while (speicher.length > 0) {
			//nehme ein element aus dem speicher
			let node = speicher.shift();

			//prüfe ob wir es noch nicht angeschaut haben
			if (!visited.includes(node)) {
				//wenn ja, merke es als angeschaut
				visited.push(node);

				// alle nachbarn in den speicher legen
				let nachbarn = ns.scan(node);
				for (let child of nachbarn) {
					speicher.push(child);
				}
			}
		} // end while


		return visited;
	} // end getServers()
}