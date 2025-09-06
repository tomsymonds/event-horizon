import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import Event from 'Event'
import EventModal from 'EventModal';
import { FileManager } from 'fileManagement';


//An Obsidian plugin to create and manage dated events
interface EventHorizonSettings {
	tags: string;
	type: string;
	projectDisplayName: string;
}

const DEFAULT_SETTINGS: EventHorizonSettings = {
	tags: "Event",
	type: "Event",
	projectDisplayName: "Story"
}	

export default class EventHorizon extends Plugin {
	settings: EventHorizonSettings;

	async onload() {
		await this.loadSettings();

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');


		this.addCommand({
			id: 'open-fileManager-test',
			name: 'File Manager Test',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const fileManager = new FileManager(this.app, this.settings)

				const result = fileManager.createFile({
					type: "Event",
					path: "Test folder/testing parent creation",
					metadata: {
						day: "24", 
						notAllowed: "test",
					},
					onCreate: (result: any) => {	
						new Notice(result.message);
						if(result.status === 'error') {
							console.log(result.message)
						}
						//Add functionality here to prompt for a new title if the file already exists
					}
				})
				if(result.status === 'error') {
					console.log(result.message)
				}

				// fileManager.updateFile(
				// 	"Test folder/A new event", 
				// 	{day: "01", month: "01", year: "2003", tags: ["Test", "AnotherTest"], sourceNoteLink: `[[${parent?.basename}]]`}, 
				// 	(result: any) => {
				// 		new Notice(result.message);
				// 		console.log(result.message)
				// 		console.log(result.file)
				// 	//Add functionality here to prompt for a new title if the file already exists	
				// 	}
				// )
			}
		});
		
		// Create an event from selected text, open a modal to edit details, and save to file
		this.addCommand({
			id: 'event-horizon-command-create',
			name: 'Create Event',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				// const text = editor.getSelection();
				// const currentFile = this.app.workspace.getActiveFile();
				// const parentMetadata = currentFile? this.app.metadataCache.getFileCache(currentFile) : null
				// const event = new Event(text, currentFile, parentMetadata, this.settings, false);
				// const save = (newEvent: any) => {
				// 	if(!newEvent.valid()){	
				// 		new Notice("Event is not valid and cannot be saved\nIt must have at least a year and a description");
				// 		return
				// 	}
				// 	saveTextFile(this.app,`Events/${newEvent.fileName()}`, newEvent.toFile());
        		// 	new Notice("File saved!");
				// }
				// new EventModal(this.app, "Create", event, this.settings, save).open()
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new EventSettingsTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		console.log("settings", this.settings)
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class EventSettingsTab extends PluginSettingTab {
	plugin: EventHorizon;

	constructor(app: App, plugin: EventHorizon) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		
		//Setting for default event type - 
		new Setting(containerEl)
			.setName('Default type')
			.setDesc('Add this type to every event created')
			.addText(text => text
				.setPlaceholder('Type')
				.setValue(this.plugin.settings.type)
				.onChange(async (value) => {
					this.plugin.settings.type = value;
					await this.plugin.saveSettings();
				}));

		// Setting for project display name
		new Setting(containerEl)
			.setName('Display name for projects')
			.setDesc('Use this name when linking to projects')
			.addText(text => text
				.setPlaceholder('Display name')
				.setValue(this.plugin.settings.projectDisplayName)
				.onChange(async (value) => {
					this.plugin.settings.projectDisplayName = value;
					await this.plugin.saveSettings();
				}));
		
		//Setting for default tags
		new Setting(containerEl)
			.setName('Default tags')
			.setDesc('Add these tags to every event created, separated by spaces')
			.addText(text => text
				.setPlaceholder('Tags')
				.setValue(this.plugin.settings.tags)
				.onChange(async (value) => {
					this.plugin.settings.tags = value;
					await this.plugin.saveSettings();
				}));
	}
}

