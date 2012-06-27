var xmlSource = "";
var recentHash = "";

function setXMLSource(xml){
	xmlSource = xml;
}

function loadXMLDoc(docname) {
	if (window.XMLHttpRequest) {
		xhttp=new XMLHttpRequest();
	} else {
		xhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhttp.open("GET",docname,false);
	xhttp.send();
	return xhttp.responseXML;
} 

function capitalize(string){
	string = string.charAt(0).toUpperCase(0) + string.slice(1);
	return string;
}

function formatTitle(title){
	title = title.split("_");
	for (word = 0; word < title.length; word++){
		title[word] = capitalize(title[word]);
	}
	title = title.join(" ");
	return title;
}

function drawProjectGallery(xml){	
	xmlDoc=loadXMLDoc(xml);
	projectList = xmlDoc.getElementsByTagName('project');
	for (currentProject = 0; currentProject < projectList.length; currentProject++){
		var name = projectList[currentProject].getAttribute("name");
		var title = formatTitle(name);
		var src = projectList[currentProject].getAttribute("thumb");
		if (src == "" || !src){
			src = "images/project_thumbs/not_found_thumb.jpg";
		}
		document.getElementById('imageNav').innerHTML += "<div class='projectGalleryImgDiv' onmouseover='toggleSelected(this)' onmouseout='toggleSelected(this)'>" 
		+ "<a href='#" + name + "'>"
		+ "<div class='redBg'></div>"
		+ "<img class='projectThumb' src ='" + src + "' />"
		+ "<span class='projectTitle'>" + title + "</span>" 
		+ "</a>"
		+ "</div>";
	}
}

function pollHash() {
	if (!window.location.hash) {
		document.getElementById('main').innerHTML = "";
	} else if (window.location.hash==recentHash) {
		return; // Nothing's changed since last polled.
	}
	recentHash = window.location.hash;
	// URL has changed, update the UI accordingly.
	var openProject = removeHash(recentHash);
	drawProject(openProject, xmlSource);
	window.scrollTo(0,0);
}

function removeHash(str){
	str = str.slice(1);
	return str;
}

function formatText(text) {
	//a
	text = text.replace(/#hyperlink#/g, "<a>");
	text = text.replace(/#_hyperlink#/g, "</a>");
	//p
	text = text.replace(/#paragraph#/g, "<p>");
	text = text.replace(/#_paragraph#/g, "</p>");
	//ul
	text = text.replace(/#ulist#/g, "<ul>");
	text = text.replace(/#_ulist#/g, "</ul>");	
	//li
	text = text.replace(/#list#/g, "<li>");
	text = text.replace(/#_list#/g, "</li>");
	return text
}

function initializeStateFromURL() {
	var openProject = window.location.hash;
	if (!openProject){
		document.getElementById('main').innerHTML = "";	
	} else {
		openProject = removeHash(openProject);
		drawProject(openProject, xmlSource);
	}
}

function drawProject(projectName, xml){
	var imgTitle = "";
	var imgSrc = "";
	var thumbSrc = "";	
	var imgCaption = "";
	var imgText = "";
	var project = "";	

	xmlDoc=loadXMLDoc(xml);
	projectList = xmlDoc.getElementsByTagName('project');
	for (currentProject = 0; currentProject < projectList.length; currentProject++){
		if(projectList[currentProject].getAttribute("name") == projectName){
			project = projectList[currentProject];
			break;
		}
	}

	projectName = project.getAttribute("name");

	//use projectName for the #
	window.location.hash = projectName;

	//now format projectName to be used as the header
	projectName = formatTitle(projectName);	
	elementList=project.childNodes;
		
	//cleans out the 'main' div for the images to be redrawn
	document.getElementById('main').innerHTML = "";

	//draw header
	document.getElementById('main').innerHTML += "<h2>" + projectName + "</h2><br />";

	//iterate through each image
	for (currentImage = 0; currentImage < elementList.length; currentImage++) {
		//debug stuff		
		//document.getElementById('main').innerHTML += x[currentImage];
		//nodeType 1 == 'element_node'
		if (elementList[currentImage].nodeType==1) {
			if (elementList[currentImage].nodeName == "image") {
				for (currentAttr = 0; currentAttr < elementList[currentImage].childNodes.length; currentAttr++) {
						var element = elementList[currentImage].childNodes[currentAttr];
						//thumbsrc and caption might not be necessary with the new design
						if (element.nodeName == "title") {
							var imgTitle = element.childNodes[0].nodeValue;
						} else if (element.nodeName == "src") {
							var imgSrc = element.childNodes[0].nodeValue;
						} else if (element.nodeName == "thumbsrc") {
							var thumbSrc = element.childNodes[0].nodeValue;
						} else if (element.nodeName == "caption") {
							var imgCaption = element.childNodes[0].nodeValue;
						}		
				}//currentAttr for
			document.getElementById('main').innerHTML += 
			"<img class='gallery_img' " 
			+ "onmouseover='$(this).animate({opacity: 1.0})' onmouseout='$(this).animate({opacity: 0.4})' onclick='toggleImgSize(this) '" 
			+ "src='" + imgSrc + "' />"

			} else if(elementList[currentImage].nodeName == "text") {
				imgText = elementList[currentImage].childNodes[0].nodeValue;
				imgText = formatText(imgText);
				document.getElementById('main').innerHTML += "<p>" + imgText + "</p>";
			} //else 
		}//nodeType if
	//after the attributes are collected, draw the thumbnail image finally
	}//currentImage for
}//drawGallery

function toggleImgSize(element) {
	currentSize = element.style.width;
	if (currentSize != '700px') {
		newSize = '700px';
	} else {
		newSize = '400px';
	}
	element.style.width = newSize;
}

