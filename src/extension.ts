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

					for (var i = 0; i < document.lineCount; i++) {
						var line = document.lineAt(i)
						
						if (line.text.startsWith("resources:")) {
							let symbol = new vscode.DocumentSymbol(
								line.text, "",
								vscode.SymbolKind.Field,
								line.range, line.range)

							symbol.children.push(new vscode.DocumentSymbol(
								"child", "",
								vscode.SymbolKind.Property,
								line.range, line.range))
							
							symbols.push(symbol)
						}
					}

					resolve(symbols)
			});
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
