import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { RestServiceProvider } from '../../providers/rest-service/rest-service';
import { Observable } from 'rxjs/Observable';

import { GrammarViewPage } from '../grammar-view/grammar-view';


@Component({
  selector: 'page-grammar-list',
  templateUrl: 'grammar-list.html',
})
export class GrammarListPage {

	grammarListLatest: any = [] //Observable<any>;
	grammarList: any = [];
	token: string;

	constructor(public restService: RestServiceProvider, public navCtrl: NavController, public navParams: NavParams, private sqLite: SQLite) {
		this.getGrammar();
		this.checkLatest(); //just for testing
	}


	checkLatest() {
		this.restService.authenticate()
		.map(result => result)
		.subscribe((result: any) => {
			
			console.log(result);
			this.token = result.token;

			this.restService.getLessons(this.token)
			.map(result => result)
			.subscribe((result: any) => {
				this.grammarListLatest = result; 
				console.log ("dun dun it", this.grammarListLatest);
			}, function onError(error) {
				console.log('error in lesson get', error)
			});		
		}, function onError(error) {
			console.log('error in authentication:', error);
		});
	}

	updateGrammar() {
		// this.restService.getLessons(token).map(result => result).subscribe((result: any) => {
		// 	this.grammarListLatest = result; 
		// 	this.storeUpdate(); 
		// 	this.getGrammar();
		// }, function onError(error) {
		// 	console.log('gone wrong')
		// });
	}

	storeUpdate() {
		this.sqLite.create({
			  name: 'notes.db',
			  location: 'default',
			}).then((db: SQLiteObject) => {
				for (var x = 0; x < this.grammarListLatest.grammarList.length; x++) {
					db.executeSql('INSERT INTO grammar VALUES(?,?,?,?,?)', [this.grammarListLatest.grammarList[x].lessonID, this.grammarListLatest.grammarList[x].lessonName, this.grammarListLatest.grammarList[x].level, this.grammarListLatest.grammarList[x].summary, this.grammarListLatest.grammarList[x].lessonText])
					console.log('length' + this.grammarListLatest.grammarList[x].examples.length);
					for (var z = 0; z < this.grammarListLatest.grammarList[x].examples.length; z++) {
						db.executeSql('INSERT INTO examples VALUES(NULL,?,?,?,NULL)', [this.grammarListLatest.grammarList[x].lessonID, this.grammarListLatest.grammarList[x].examples[z].english, this.grammarListLatest.grammarList[x].examples[z].japanese])
						console.log('inside examples loop' + this.grammarListLatest.grammarList[x]);
					}
				}
			})
			.then(res => {
				console.log('inserted columns as ', this.grammarListLatest) 
			}) 
			.catch(e => console.log(e));
	}

	getGrammar() {
	 	this.sqLite.create({
			name: 'notes.db',
			location: 'default',
		}).then((db: SQLiteObject) => {
			db.executeSql(`CREATE TABLE IF NOT EXISTS grammar (
				lessonID INTEGER PRIMARY KEY, 
				lessonName TEXT,
				level INTEGER,
				summary TEXT,
				lessonText TEXT
		   	)`, [])
		.then(res => {
		console.log('created table grammar') 
		})
		.catch(e => console.log(e));
		db.executeSql(`CREATE TABLE IF NOT EXISTS examples (
			exampleID INTEGER PRIMARY KEY, 
			lessonID INTEGER,
			english TEXT,
			japanese TEXT,
			audiopath TEXT,
			FOREIGN KEY(lessonID) REFERENCES grammar(lessonID)
		)`, [])
		.then(res => {
			console.log('created table examples') 
		})
		.catch(e => console.log(e));

		db.executeSql('SELECT * FROM grammar ORDER BY lessonID DESC', [])
		.then(res => {
		for(var i = 0; i < res.rows.length; i++) {
			this.grammarList.push({
				lessonID: res.rows.item(i).lessonID,
				lessonName: res.rows.item(i).lessonName,
				level: res.rows.item(i).level,
				summary: res.rows.item(i).summary,
				lessonText: res.rows.item(i).lessonText,
				examples: []
			})

			db.executeSql('SELECT * FROM examples WHERE lessonID=?',[res.rows.item(i).lessonID])
			.then(res => {
				for(var x = 0; x < this.grammarList.length; x++)
					for(var j = 0; j < res.rows.length; j++) {
						this.grammarList[x].examples.push({
							english: res.rows.item(j).english,
							japanese: res.rows.item(j).japanese,
						})
					}
			})
			.catch(e => console.log(e))
			console.log(this.grammarList);
			}
		})
		.catch(e => console.log(e))

		.then(() => {
			if (this.grammarList.length == 0) {
			  console.log('grammar list empty, calling API')
			  this.updateGrammar();
			}
		})
		
		});    
	}

	viewLesson(id) {
		this.navCtrl.push(GrammarViewPage, {lessonID:id});
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad GrammarListPage');
	}

}

