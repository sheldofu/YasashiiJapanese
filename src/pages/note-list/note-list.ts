import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { NoteAddPage } from '../note-add/note-add';
import { NoteEditPage } from '../note-edit/note-edit';

@Component({
  selector: 'page-note-list',
  templateUrl: 'note-list.html',
})
export class NoteListPage {

  notes: any = [];
  status: string = "none";

  constructor(
		public navCtrl: NavController, 
		public navParams: NavParams,
		private sqLite: SQLite
	) {

	}

	getNotes() {
		this.sqLite.create({
			name: 'notes.db',
			location: 'default',
		}).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, english TEXT, japanese TEXT, audio TEXT)', [])
			.then(res => {
				console.log('created table') 
				this.status = "created table"
			})
    		.catch(e => console.log(e));
    		db.executeSql('SELECT * FROM notes ORDER BY id DESC', [])
		    .then(res => {
				for(var i = 0; i < res.rows.length; i++) {
					this.notes.push({
						id: res.rows.item(i).id,
						english: res.rows.item(i).english,
						japanese: res.rows.item(i).japanese,
						audio: res.rows.item(i).audio
					})
				}
				console.log(this.notes);
			})
			.catch(e => console.log(e));
		});		
	}

	gotoAdd() {
		this.navCtrl.push(NoteAddPage);
	}

	gotoEdit(id) {
		this.navCtrl.push(NoteEditPage, {id:id});
	}

	deleteNote(id) {
		this.sqLite.create({
			name: 'notes.db',
			location: 'default',
		}).then((db: SQLiteObject) => {
			db.executeSql('DELETE FROM notes WHERE id=?', [id])
			.then(res => {
				console.log(res);
				this.getNotes();
			})
			.catch(e => console.log(e));
			}).catch(e => console.log(e));
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad NoteListPage');
		this.getNotes();
	}

}