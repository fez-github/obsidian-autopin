import {
	App,
	Editor,
	FileStats,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	View,
} from "obsidian";

//Obsidian type definitions don't seem to be up to date, so I'm implementing my own.
interface LeafView extends View {
	file: {
		basename: string;
		deleted: boolean;
		extension: string;
		name: string;
		path: string;
		saving: boolean;
	};
}

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		this.registerEvent(
			this.app.workspace.on("file-open", (file: any) => {
				console.log("Event fired!");
				const curLeaf = this.app.workspace.getMostRecentLeaf();
				let curView: any = curLeaf?.view;
				this.app.workspace.iterateRootLeaves((leaf) => {
					let thisView: any = leaf.view;
					console.log("This View:", thisView.file.name);
					console.log("Cur View:", curView.file.name);
					if (curView.file.name === thisView.file.name) {
						curLeaf?.detach();
						this.app.workspace.setActiveLeaf(leaf);
						return;
					}
					console.log({ leaf });
				});
				curLeaf?.setPinned(true);

				//On first click, app behaves as intended.  But on 2nd click, a new leaf is opened.  Why?
				//File-open is not fired at all, yet a new leaf opens up.
			})
		);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
