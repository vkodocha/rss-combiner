exports.handler = function(event, context, callback) {
	require('dotenv').config();
	const publicFeed = process.env.FEED0;
	const privateFeed = process.env.FEED1;
	const feedRead = require ("davefeedread");
	
	console.log('Fetching content of feed0');
	loadFeed(publicFeed, function(theFeed0) {
		console.log('Fetching content of feed1');
		loadFeed(privateFeed, function(theFeed1) {
			console.log('Feed fetched now combine');
			let combined = theFeed0.items.concat(theFeed1.items);
			combined.sort((a,b) => (a.pubdate > b.pubdate) ? 1 : ((b.pubdate > a.pubdate) ? -1 : 0));
			
			var f2 = writePodcastFeed(theFeed0.head.title, theFeed0.head.description, theFeed0.head.link, theFeed0.head.pubdate, theFeed0.head.language, theFeed0.head.copyright, theFeed0.head.image.url, theFeed0.head.categories, combined);
	    
			callback(null, {
		    statusCode: 200,
			headers: {
				"Content-Type": "application/rss+xml"
			},
		    body: f2
		    });
		}, function(err) {
			callback(err);
		});
	}, function(err) {
		callback(err);
	});
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

function writePodcastFeed(title, description, link, date, language, copyright, image, categories, articles) {
	const Podcast = require('podcast');
	
	let firstArticle = {};
	if (articles.length > 0) {
		firstArticle = articles[0].meta;
	}
	const owner = firstArticle['itunes:owner'];
	const feed = new Podcast({
	    title: title,
	    description: description,
	    site_url: link,
	    image_url: image,
	    docs: link,
	    author: firstArticle.author,
	    managingEditor: 'n/a',
	    webMaster: 'n/a',
	    copyright: copyright,
	    language: language,
	    categories: categories,
	    pubDate: date,
	    ttl: '60',
	    itunesAuthor: (firstArticle['itunes:author'] ? firstArticle['itunes:author']['#'] : 'n/a'),
	    itunesSubtitle: (firstArticle['itunes:subtitle'] ? firstArticle['itunes:subtitle']['#'] : 'n/a'),
	    itunesSummary: (firstArticle['itunes:summary'] ? firstArticle['itunes:summary']['#'] : 'n/a'),
	    itunesOwner: { 
			name: (owner && owner['itunes:name'] ? owner['itunes:name']['#'] : 'n/a'), 
			email: (owner && owner['itunes:email'] ? owner['itunes:email']['#'] : 'n/a')
		},
	    itunesExplicit: false,
	    itunesCategory: [],
	    itunesImage: (firstArticle['itunes:image'] && firstArticle['itunes:image']['@'] ? firstArticle['itunes:image']['@']['href'] : 'n/a')
	});
	
	articles.forEach(function(item, i) {
		console.log('Write feed item: ' + i + ' ' + item.title);
		
		const meta = item.meta
		feed.addItem({
		    title:  item.title,
		    description: item.description,
		    url: item.url,
		    categories: item.categories,
		    author: item.author,
		    date: item.date,
		    enclosure : {url: item.enclosures[0].url, size: item.enclosures[0].length, type: item.enclosures[0].type },
		    itunesAuthor: (meta && meta['itunes:author'] ? meta['itunes:author']['#'] : 'n/a'),
		    itunesExplicit: false,
		    itunesSubtitle: (meta && meta['itunes:subtitle'] ? meta['itunes:subtitle']['#'] : 'n/a'),
		    itunesSummary: (meta && meta['itunes:summary'] ? meta['itunes:summary']['#'] : 'n/a'),
		    itunesDuration: (meta && meta['itunes:duration'] ? meta['itunes:duration']['#'] : 'n/a'),
		    itunesKeywords: []
		});
	});
	
	return feed.buildXml();
}