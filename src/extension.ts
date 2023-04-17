import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(
		{language: "kod"}, new KodDocumentSymbolProvider()
	));
}

class KodDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
	public provideDocumentSymbols(
			document: vscode.TextDocument,
			token: vscode.CancellationToken): Promise<vscode.DocumentSymbol[]> {
			return new Promise((resolve, reject) => {
				let symbols: vscode.DocumentSymbol[] = [];
				
				// Once we're parsing messages, don't parse any of the previous sections
				let inMessages = false;

				let classRegex 		= /^(?!end\b)([A-Za-z]+)\b(?!:)/;
				let sectionRegex 	= /^([A-Za-z]+)\b(?=:)/;
				let resourceRegex = /^[ \t]*([a-z_]+)\s+=\s+(.*)/;
				let classvarRegex = /^[ \t]*([v][a-zA-Z_]+)\s+=\s+([^\s%]*)/;
				let propertyRegex = /^[ \t]*([p][a-zA-Z_]+)\s+=\s+([^\s%]*)/;
				let messageRegex 	= /^\s*(?!.*[@#"])([A-Z]\w+)\s*\((.*)\)/;

				let currentParentName = "";

				for (let i = 0; i < document.lineCount; i++) {
					let line = document.lineAt(i);
					let match = line.text.match(classRegex);
						
					if (!inMessages) {
						if (match) {
							let symbol = new vscode.DocumentSymbol(
								match[1],
								"",
								vscode.SymbolKind.Class,
								line.range,
								line.range
							);
							symbols.push(symbol);

							// Continue to the next line of the document
							continue;
						}

						// Continue to parse the document for sections
						match = line.text.match(sectionRegex);
						if (match) {
							let symbol = new vscode.DocumentSymbol(
								match[1],
								"",
								vscode.SymbolKind.Namespace,
								line.range,
								line.range
							);
							// symbols.push(symbol);

							// Save symbol as a child of the first symbol
							symbols[0].children.push(symbol);
							
							currentParentName = match[1];

							continue;
						}

						// Continue to parse the document for resources
						match = line.text.match(resourceRegex);
						if (match) {
							let symbol = new vscode.DocumentSymbol(
								match[1],
								match[2],
								vscode.SymbolKind.Variable,
								line.range,
								line.range
							);

							symbols[0].children.forEach((section) => {
								if (section.name === currentParentName) {
									section.children.push(symbol);
								}
							});
						
							continue;
						}

						// Continue to parse the document for classvars
						match = line.text.match(classvarRegex);
						if (match) {
							let symbol = new vscode.DocumentSymbol(
								match[1],
								match[2],
								vscode.SymbolKind.Variable,
								line.range,
								line.range
							);
							
							symbols[0].children.forEach((section) => {
								if (section.name === currentParentName) {
									section.children.push(symbol);
								}
							});

							continue;
						}

						// Continue to parse the document for properties
						match = line.text.match(propertyRegex);
						if (match) {
							let symbol = new vscode.DocumentSymbol(
								match[1],
								match[2],
								vscode.SymbolKind.Variable,
								line.range,
								line.range
							);
							
							symbols[0].children.forEach((section) => {
								if (section.name === currentParentName) {
									section.children.push(symbol);
								}
							});

							continue;
						}
					}

					// Continue to parse the document for messages
					match = line.text.match(messageRegex);
					if (match) {
						inMessages = true;

						let symbol = new vscode.DocumentSymbol(
							match[1],
							match[2],
							vscode.SymbolKind.Method,
							line.range,
							line.range
						);
						
						symbols[0].children.forEach((section) => {
							if (section.name === currentParentName) {
								section.children.push(symbol);
							}
						});

						continue;
					}
				}

				resolve(symbols);
			});
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
