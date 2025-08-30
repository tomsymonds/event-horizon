import { App, Modal, Setting } from 'obsidian';
import Event from 'Event'

//Displays an Obsidian modal to create an event note
export default class EventModal extends Modal {
    constructor(app: App, type: string, event: Event, settings: any, onSubmit: any) {
        console.log(event)
        super(app);
        this.setTitle(`${type} Event`)
        //Add a listener for Enter key to submit the form
        this.scope.register([], 'Enter', (evt: KeyboardEvent) => {
            if (evt.isComposing) {
                return;
            }
            evt.preventDefault()	
            const actionBtn = document
                    .getElementsByClassName('mod-cta')
                    .item(0) as HTMLButtonElement | null;
                actionBtn?.click();
        });
        const eventValues = {
            description: event.description,
            day: event.text.day,
            month: event.text.month,
            year: event.text.year
        }

        type == "Create" && new Setting(this.contentEl)
            .setName('Description')
            .addTextArea((text) =>
                text
                    .setValue(event.description)
                    .onChange((value) => {
                        event.description = value;
                    })
                )

        new Setting(this.contentEl)
            .setName('Day')
            .addText((text) =>
                text
                    .setValue(event.text.day)
                    .onChange((value) => {
                        event.day = Number(value);
                    })
                )
        new Setting(this.contentEl)
            .setName('Month')
            .addText((text) =>
                text
                    .setValue(event.text.month)
                    .onChange((value) => {
                        event.month = Number(value);
                    })
                )
        new Setting(this.contentEl)
            .setName('Year')
            .addText((text) =>
                text
                    .setValue(event.text.year)
                    .onChange((value) => {
                        event.year = Number(value);
                    })
                )
        type == "Create" && new Setting(this.contentEl)
            .setName('Parent')
            .addText((text) =>
                text
                    .setValue(event.sourceNoteLink || "")
                    .onChange((value) => {
                        event.sourceNoteLink = `"${value}"`;
                    })
                )
        type == "Edit" && new Setting(this.contentEl)
            .setName(settings.projectLinkName)
            .addText((text) =>
                text
                    .setValue(event.projectLink || "")
                    .onChange((value) => {
                        event.projectLink = `"${value}"`;
                    })
                )
        new Setting(this.contentEl)
            .addButton((btn) => btn
            .setButtonText('Submit')
            .setCta()
            .onClick(() => {
                this.close();
                onSubmit(event);
          }));
    }
}