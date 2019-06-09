exports.handler = function(event, context, callback) {
	require('dotenv').config();
	const publicFeed = process.env.FEED0;
	const privateFeed = process.env.FEED1;
	
	console.log("Feed0: " + publicFeed);
	
	const fs = require ("fs");
	const utils = require ("daveutils");
	const feedRead = require ("davefeedread");
	
	
	

	//const urlTestFeed = "http://feeds.wnyc.org/radiolab";
	const timeOutSecs = 30;
	const whenstart = new Date ();

	/*feedRead.parseUrl (publicFeed, timeOutSecs, function (err, theFeed) {
		if (err) {
		    callback(err);
			}
		else {
			var res = "";
			res = "It took " + utils.secondsSince (whenstart) + " seconds to read and parse the feed.";
			console.log ("theFeed.head == " + utils.jsonStringify (theFeed.head));
			console.log ("theFeed.items [0] == " + utils.jsonStringify (theFeed.items [0]));
			theFeed.items.forEach (function (item, i) {
				console.log ("Item #" + utils.padWithZeros (i, 2) + ": " + item.title + ".");
				res += "<li>" + item.title + "</li>";
				
				feed.addItem({
				    title: item.title,
				    id: item.url,
				    link: item.url,
				    description: item.description,
				    content: item.content,
				    author: [
				      {
				        name: "Jane Doe",
				        email: "janedoe@example.com",
				        link: "https://example.com/janedoe"
				      },
				      {
				        name: "Joe Smith",
				        email: "joesmith@example.com",
				        link: "https://example.com/joesmith"
				      }
				    ],
				    contributor: [
				      {
				        name: "Shawn Kemp",
				        email: "shawnkemp@example.com",
				        link: "https://example.com/shawnkemp"
				      },
				      {
				        name: "Reggie Miller",
				        email: "reggiemiller@example.com",
				        link: "https://example.com/reggiemiller"
				      }
				    ],
				    date: item.date,
				    image: item.image
				  });
			});
			//fs.writeFile ("feed.xml", utils.jsonStringify (theFeed), function (err) {
				//});
			}
			
		    callback(null, {
		    statusCode: 200,
			headers: {
				"Content-Type": "application/rss+xml"
			},
		    body: feed.rss2()
		    });
		}
	);*/
	loadFeed(publicFeed, function(theFeed0) {
		loadFeed(privateFeed, function(theFeed1) {
			let combined = theFeed0.items.concat(theFeed1.items);
			
			//console.log("Title: " + theFeed0.title + " " + theFeed0.meta.title);
			console.log(utils.jsonStringify (theFeed0.head));
			var f2 = writePodcastFeed(theFeed0.head.title, theFeed0.head.description, theFeed0.head.link, theFeed0.head.pubdate, theFeed0.head.language, theFeed0.head.copyright, theFeed0.head.image.url, null, combined);
	    
			callback(null, {
		    statusCode: 200,
			headers: {
				//"Content-Type": "application/rss+xml"
			},
		    body: f2//f.rss2()
		    });
		}, function(err) {
			callback(err);
		});
	}, function(err) {
		callback(err);
	});
		/*var f = writeFeed([]);
	    callback(null, {
	    statusCode: 200,
		headers: {
			//"Content-Type": "application/rss+xml"
		},
	    body: f.rss2()
	    });*/
}

function loadFeed(url, onSuccess, onError) {
	const utils = require ("daveutils");
	const timeOutSecs = 30;
	const feedRead = require ("davefeedread");
	feedRead.parseUrl (url, timeOutSecs, function (err, theFeed) {
		if (err) {
		    onError(err);
			return;
		}
		
		onSuccess(theFeed);	
	});
}

function writeFeed(title, description, link, date, language, copyright, image, favicon, articles) {
	const Feed = require('feed').Feed;
	const feed = new Feed({
	  title: title,
	  description: description,
	  id: link,
	  link: link,
	  language: language,
	  image: image,
	  favicon: favicon,
	  copyright: copyright,
	  updated: date,
	  generator: "awesome", // optional, default = 'Feed for Node.js'
	  feedLinks: {
	    json: "https://example.com/json",
	    atom: "https://example.com/atom"
	  },
	  author: {
	    name: "John Doe",
	    email: "johndoe@example.com",
	    link: "https://example.com/johndoe"
	  }
	});
	
	const utils = require ("daveutils");
	articles.forEach(function(item, i) {
		console.log('   ');
		console.log(utils.jsonStringify (item));
		feed.addItem({
		    title: item.title,
		    id: item.url,
		    link: item.url,
		    description: item.description,
		    content: item.content,
		    author: [ { name: 'test', email: item.author }],
		    date: item.date,
		    image: item.image.url,
			enclosures: item.enclosures,
		    "itunes:duration": {
		        "@": {},
		        "#": "51:25"
		    }
		  });
	});
	
	return feed;
}

function writePodcastFeed(title, description, link, date, language, copyright, image, favicon, articles) {
	const Podcast = require('podcast'); //.Podcast;
	console.log('test');
	const utils = require ("daveutils");
	const feed = new Podcast({
	    title: title,
	    description: description,
	    feed_url: 'http://example.com/rss.xml',
	    site_url: link,
	    image_url: image,
	    docs: link,
	    author: 'Dylan Greene',
	    managingEditor: 'Dylan Greene',
	    webMaster: 'Dylan Greene',
	    copyright: '2013 Dylan Greene',
	    language: language,
	    categories: ['Category 1','Category 2','Category 3'],
	    pubDate: date,
	    ttl: '60',
	    itunesAuthor: 'Max Nowack',
	    itunesSubtitle: 'I am a sub title',
	    itunesSummary: 'I am a summary',
	    itunesOwner: { name: 'Max Nowack', email:'max@unsou.de' },
	    itunesExplicit: false,
	    itunesCategory: [{
	        "text": "Entertainment",
	        "subcats": [{
	          "text": "Television"
	        }]
	    }],
	    itunesImage: 'http://link.to/image.png'
	});
	
	articles.forEach(function(item, i) {
		//console.log('   ');
		//console.log(utils.jsonStringify (item));
		
		feed.addItem({
		    title:  item.title,
		    description: item.description,
		    url: item.url,
		    //guid: '1123', // optional - defaults to url
		    categories: item.categories,
		    author: item.author,
		    date: item.date,
		    //lat: 33.417974, //optional latitude field for GeoRSS
		    //long: -111.933231, //optional longitude field for GeoRSS
		    enclosure : {url: item.enclosures[0].url, size: item.enclosures[0].length, type: item.enclosures[0].type }, // optional enclosure
		    itunesAuthor: 'Max Nowack',
		    itunesExplicit: false,
		    itunesSubtitle: 'I am a sub title',
		    itunesSummary: 'I am a summary',
		    itunesDuration: 12345,
		    itunesKeywords: ['javascript','podcast']
		});
	});
	
	return feed.buildXml();
}