/** sim_terminal_input.js
 * Beispielcode von 
 * https://bitburner.readthedocs.io/en/latest/netscript/advancedfunctions/inject_html.html
 * 
 * @param {NS} ns 
 * */
export async function main(ns) {
  const doc = globalThis["document"];
  // Acquire a reference to the terminal text field
  const terminalInput = doc.getElementById("terminal-input");

  // Set the value to the command you want to run.
  terminalInput.value = "home;connect n00dles;home;connect n00dles;home;";

  // Get a reference to the React event handler.
  const handler = Object.keys(terminalInput)[1];

  // Perform an onChange event to set some internal values.
  terminalInput[handler].onChange({ target: terminalInput });

  // Simulate an enter press
  terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });

}