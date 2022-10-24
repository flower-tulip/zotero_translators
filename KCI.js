{
	"translatorID": "b8d6f165-30c9-4c93-bfb8-7569922171c5",
	"label": "KCI",
	"creator": "kwhkim",
	"target": "",
	"minVersion": "5.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2022-10-18 07:57:55"
}

function detectWeb(doc, url) {
	if (url.includes("www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=")) {
		return 'journalArticle';
	}
	
	Z.monitorDOMChanges(doc.body, { childList: true });
	return false;
}

function doWeb(doc, url) {
	var newItem = new Zotero.Item("journalArticle");

	const elem_title = doc.querySelector("strong#artiTitle");
	newItem.title = elem_title.textContent;

	// 논문제목
	// const elem_title = doc.querySelector("strong#artiTitle");
	// console.log(elem_title.textContent);


	// 저널이름#1
	const elem_journal = doc.querySelector("p.jounal");
	// console.log(elem_journal.innerText);
	newItem.publicationTitle = elem_journal.innerText;

	// 저널이름#2
	const elem_journal_a = doc.querySelector("p.jounal > a");
	// console.log(elem_journal_a.innerText.trim());	

	// 권/호/쪽/날짜
	// 2021, vol.39, no.4 pp.31-57 (27 pages)
	const elem_vol = doc.querySelector("p.vol");
	// console.log(elem_vol.innerText);
	info = elem_vol.innerText;
	etc = info
	vols = info.split(',');
	year = vols[0];
	vol = info.match(/(?<=vol[.])\d+(?=[,])/)
	no = info.match(/(?<=no[.])\d+(?=\D)/)
	pages = info.match(/(?<=pp[.])\s*\d+([-]\d+)?(?=\D)/)[0]
	numPages = info.match(/(?<=[(])\d+\s*(?=pages)/)
	// page = info.match(/(?<=pp[.])\d+/)
	// no = vols[2].replace(/^\s*no[.]/, '').trim();
	// pages = no.replace(/^.*pp[.]/, '');
	// numPages = pages.replace(/pp.*(?=[(])/, '');
	// numPages = numPages.replace(/pages.*$/, '').trim();

	// pages = pages.replace(/[(].*pages[)]/, '').trim();
	// no = no.replace(/pp.*/, '').trim();
	// vol = vol.replace(/,\d.*$/, '').trim();

	newItem.volume = vol;
	newItem.issue = no;
	newItem.date = year;
	newItem.pages = pages;
	newItem.extra = etc
	newItem.numPages = numPages;
	

	// // 발행기관
	const elem_pub_a = doc.querySelector("p.pub > a");
	// console.log(elem_pub_a.innerText.trim());
	newItem.publisher = elem_pub_a.innerText.trim()

	// // 연구분야
	// const elem_subject = doc.querySelector("div.subject");
	// console.log(elem_subject.innerText.trim());



	// // 연구분야 (여럿)
	// const elem_subject_a = doc.querySelectorAll("div.subject > div.overbox > a");
	// console.log(elem_subject_a);
	// console.log(elem_subject_a[0].innerText);
	// console.log(elem_subject_a[1].innerText);


	// // 저자 (여러 명 가능)
	// const elem_author_a = doc.querySelector("div.author > a");	
	// const elem_author_a = doc.querySelectorAll("article.report-detail-top > div.author > a");	
	const elem_author = doc.querySelector("article.report-detail-top > div.author");	
	const elem_author_a = elem_author.querySelectorAll("a");	
	
	for (var j in elem_author_a) {
		try {
			j2 = j.toString();
			author = elem_author_a[j];
			// author2 = author.replace(/[/].*$/, '');		
			// console.log(j.toString() + ") " + author.innerText);
			var author2 = author.innerText
			var author3 = author2.replace(/[/].*/, '').trim();				
			newItem.creators.push(Zotero.Utilities.cleanAuthor(author3, 'author'));			
		} catch(error) {
			break;
		}
	}


		// console.log(j.toString() + ") " + author.textContent);
		// console.log(j.toString() + ") " + author.innerText);
		//var 		
	

	// author_content = elem_author.innerText.trim();
	// authors = author_content.split(',');
	// for (var j in authors) {
	// 	author = authors[j].trim();
	// 	author = author.match(/[^/]+/); //ex) 구슬기 /Seulki Ku 1 ,  김하나 /Hana Kim 2
	// 	// newItem.creators.push({fullName: author2, creatorType: "creator"});
	// 	// https://niche-canada.org/member-projects/zotero-guide/chapter17.html
	// 	newItem.creators.push(Zotero.Utilities.cleanAuthor(author, 'author'));
	// 	// console.log(author)
	// }


	// 키워드
	const elem_keywords = doc.querySelectorAll("a#keywd");
	for (var j in elem_keywords) {
		try {
			keyword = elem_keywords[j].textContent.trim();
			newItem.tags.push({tag:keyword, type:0});
		} catch(error) {
			break;
		}
		
	}
	
	// var tags = content.trim().split(/\s*;\s*/);
	// 	for (var i in tags) {
	// 		tag = tags[i]
	// 		newItem.tags.push({tag:tag, type:0});
	// 		// console.log(tag)
			
	// 	}
	// }

	// 영어 키워드
	const elem_box2 = doc.querySelectorAll('section#reportDetail > div.report-detail-left > div.articleBody > div.box')
	for (var j in elem_box2) {
		//console.log(elem_box2[j])		
		try {
			var k = elem_box2[j].querySelector('h2').textContent.trim();
			// console.log(k);
			if (k.substr(0,2) == '키워') {
				keywords_english = elem_box2[j].querySelector('div.innerBox > p').textContent.split(',');
				// console.log(elem_box2[j].querySelector('div.innerBox > p').textContent);
				for (var j2 in keywords_english) {
					keyword_eng = keywords_english[j2];
					//console.log(keyword_eng);
					newItem.tags.push({tag:keyword_eng, type:0});
				}
			}
		} catch(error) {
			break
		}
	}


	// 초록 (한글)
	const elem_abstract_kor = doc.querySelector("p#korAbst");
	// console.log(elem_abstract_kor.innerText.trim());
	newItem.abstractNote = elem_abstract_kor.innerText.trim();

	// // 초록 (영어)
	const elem_abstract_eng = doc.querySelector("p#engAbst");
	// console.log(elem_abstract_eng.innerText.trim());
	newItem.extra = "[@영문초록]\n" + elem_abstract_eng.innerText.trim();




  	newItem.complete()
}/** BEGIN TEST CASES **/
var testCases = [
]
/** END TEST CASES **/
