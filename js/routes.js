
import Mustache from "./mustache.js";
import processOpnFrmData from "./addOpinion.js";
import articleFormsHandler from "./articleFormsHandler.js";

export default[

    {
        hash:"uvod",
        target:"router-view",
        getTemplate:(targetElm) =>
            document.getElementById(targetElm).innerHTML =
                document.getElementById("template-uvod").innerHTML
    },
    {
        hash:"articles",
        target:"router-view",
        getTemplate: fetchAndDisplayArticles
    },
    {
        hash:"article",
        target:"router-view",
        getTemplate: fetchAndDisplayArticleDetail
    },
    {
        hash:"opinions",
        target:"router-view",
        getTemplate: createHtml4opinions
    },
    {
        hash:"artEdit",
        target:"router-view",
        getTemplate: editArticle
    },
    {
        hash:"artDelete",
        target:"router-view",
        getTemplate: deleteArticle
    },
    {
        hash:"artInsert",
        target:"router-view",
        getTemplate: InsertArticle
    },
    {
        hash:"addOpinion",
        target:"router-view",
        getTemplate: (targetElm) =>{
            document.getElementById(targetElm).innerHTML = document.getElementById("template-addOpinion").innerHTML;
            document.getElementById("opnFrm").onsubmit=processOpnFrmData;
        }
    },
    function disp(form,button) {
        if (form.style.display == "none") {
            form.style.display = "block";
            button.style.display = "none";
        } else {
            form.style.display = "none";
            button.style.display= "block";
        }
    }
    ];

$.ajaxSetup({
    async: false
});
const urlBase = "https://wt.kpi.fei.tuke.sk/api";
const articlesPerPage = 20;
const commentPerPage = 5;

function fetchAndDisplayArticles(targetElm, offsetFromHash, totalCountFromHash, ifMy){

    const offset=Number(offsetFromHash);
    const tCount=Number(totalCountFromHash);

    let url = ``;
    if(ifMy == 1){
        url = `${urlBase}/article?tag=myVinoTag`;
    }
    else {
        let urlQuery = "";
        if (offset && tCount) {
            urlQuery = `?offset=${offset}&max=${articlesPerPage}`;
        } else {
            urlQuery = `?max=${articlesPerPage}`;
        }
        url = `${urlBase}/article${urlQuery}`;
    }

    function reqListener () {
        if (this.status == 200) {
            const responseJSON = JSON.parse(this.responseText);
            responseJSON.current=offset;
            responseJSON.totalCount=responseJSON.meta.totalCount;
            responseJSON.ifMy = ifMy;

            if(responseJSON.current>1){
                responseJSON.prevPage=responseJSON.current-articlesPerPage+1;
                responseJSON.prevPage2=responseJSON.current-articlesPerPage;
            }

            if(responseJSON.current<responseJSON.totalCount-articlesPerPage){
                responseJSON.nextPage=responseJSON.current+articlesPerPage;
                responseJSON.nextPage2 = responseJSON.nextPage;
            }
            else{
                responseJSON.nextPage2 = responseJSON.totalCount;
            }

            responseJSON.lastPage = (Math.trunc(responseJSON.totalCount/articlesPerPage))*articlesPerPage + 1;
            if(responseJSON.lastPage>= responseJSON.totalCount){
                responseJSON.lastPage = responseJSON.totalCount - articlesPerPage + 1;
            }

            responseJSON.current++;

            addArtDetailLink2ResponseJson(targetElm,responseJSON);

            responseJSON.articles.forEach(article => {
                    $.getJSON(`${urlBase}/article/${article.id}`, callbackFuncWithData);
                    function callbackFuncWithData(json) {
                        article.content =  `${json.content.substr(0, 100)}`;
                        if(article.content.length >= 99){
                            article.content += "...";
                        }
                    }
                }
            );

            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles").innerHTML,
                    responseJSON
                );

        } else {
            const errMsgObj = {errMessage:this.responseText};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        }

    }

    var ajax = new XMLHttpRequest();
    ajax.addEventListener("load", reqListener);
    ajax.open("GET", url, true);
    ajax.send();
}

function fetchAndDisplayArticleDetail(targetElm,artIdFromHash,offsetFromHash,totalCountFromHash,commentNum,ifMy) {
    fetchAndProcessArticle(targetElm,artIdFromHash,offsetFromHash,totalCountFromHash,commentNum,false,ifMy);
}

function createHtml4opinions(targetElm){
    const opinionsFromStorage=localStorage.myComments;
    let opinions=[];

    if(opinionsFromStorage){
        opinions=JSON.parse(opinionsFromStorage);
    }

    document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-opinions").innerHTML,
        opinions
    );
}


function addArtDetailLink2ResponseJson(targetElm,responseJSON){
    responseJSON.articles = responseJSON.articles.map(
        article =>(
            {
                ...article,
                detailLink:`#article/${article.id}/${responseJSON.meta.offset}/${responseJSON.meta.totalCount}/0/${responseJSON.ifMy}`,
            }
        ),
    );
}

function editArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash,ifMy) {
    fetchAndProcessArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash,0,true,ifMy);
}

function deleteArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash,ifMY) {
    const url = `${urlBase}/article/${artIdFromHash}`;

    const ajax = new XMLHttpRequest();
    ajax.open('DELETE', url, true);
    ajax.onload = function() {
        const status = ajax.status;
        if (status == 204) {
            window.alert("Delete article successfully saved on server");
        } else {
            const errMsgObj = {errMessage:this.responseText};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        }
    };
    ajax.send();

    fetchAndDisplayArticles(targetElm, offsetFromHash, totalCountFromHash-1,ifMY);
    fetchAndDisplayArticles(targetElm, offsetFromHash, totalCountFromHash-1,ifMY);
}

function InsertArticle(targetElm) {

    const url = `${urlBase}/article?max=1`;

    function reqListener () {
        if (this.status == 200) {
            const responseJSON = JSON.parse(this.responseText);
            responseJSON.formTitle = "Article Add";
            responseJSON.submitBtTitle="Save article";
            responseJSON.backLink=`#uvod`;

            var tCount = responseJSON.meta.totalCount;
            var lastPage = (Math.trunc(tCount/articlesPerPage))*articlesPerPage + 1;
            if(lastPage>= tCount){
                lastPage = tCount - articlesPerPage + 1;
            }

            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-article-form").innerHTML,
                    responseJSON
                );
            if(!window.artFrmHandler){
                window.artFrmHandler= new articleFormsHandler("https://wt.kpi.fei.tuke.sk/api");
            }
            window.artFrmHandler.assignFormAndArticle("articleForm","hiddenElm",-1,lastPage,tCount,0);
        } else {
            const errMsgObj = {errMessage: this.responseText};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        }
    }

    const ajax = new XMLHttpRequest();
    ajax.addEventListener("load", reqListener);
    ajax.open('GET', url, true);
    ajax.send();
    }

function fetchAndProcessArticle(targetElm,artIdFromHash,offsetFromHash,totalCountFromHash,commentNum,forEdit,ifMy){
    const url = `${urlBase}/article/${artIdFromHash}`;

        function reqListener() {
            if (this.status == 200) {
                const responseJSON = JSON.parse(this.responseText)

                let myTags = `${responseJSON.tags}`.split(",");
                const myTagIndex = myTags.indexOf("myVinoTag");
                if(myTagIndex != -1){
                        myTags.splice(myTagIndex,1);
                }
                responseJSON.tags = myTags;

                if (forEdit) {
                    responseJSON.formTitle = "Article Edit";
                    responseJSON.submitBtTitle = "Save article";
                    responseJSON.backLink = `#article/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}/${commentNum}/${ifMy}`;

                    document.getElementById(targetElm).innerHTML =
                        Mustache.render(
                            document.getElementById("template-article-form").innerHTML,
                            responseJSON
                        );
                    if (!window.artFrmHandler) {
                        window.artFrmHandler = new articleFormsHandler("https://wt.kpi.fei.tuke.sk/api");
                    }
                    window.artFrmHandler.assignFormAndArticle("articleForm", "hiddenElm", artIdFromHash, offsetFromHash, totalCountFromHash,ifMy);
                } else {
                    console.log(responseJSON);
                    responseJSON.artId = Number(artIdFromHash);
                    responseJSON.offset = Number(offsetFromHash);
                    responseJSON.totalCount = Number(totalCountFromHash);
                    responseJSON.ifMy= ifMy;

                    responseJSON.backLink = `#articles/${offsetFromHash}/${totalCountFromHash}/${ifMy}`;
                    responseJSON.editLink =
                        `#artEdit/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}/${commentNum}/${ifMy}`;
                    responseJSON.deleteLink =
                        `#artDelete/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}/${ifMy}`;

                    $.getJSON(`${url}/comment?offset=${commentNum}&max=${commentPerPage}`,callbackFuncWithData);
                    function callbackFuncWithData(data) {
                        responseJSON.comments = data.comments;
                        responseJSON.commentsCount = data.meta.totalCount;
                    }

                    if(commentPerPage <= Number(commentNum)) {
                        responseJSON.prevComment = Number(commentNum)-commentPerPage + 1;
                        responseJSON.prevComment2 = responseJSON.prevComment-1;
                    }

                    if(Number(commentNum) + commentPerPage < responseJSON.commentsCount) {
                        responseJSON.nextComment = Number(commentNum) + commentPerPage;
                    }

                    document.getElementById(targetElm).innerHTML =
                        Mustache.render(
                            document.getElementById("template-article").innerHTML,
                            responseJSON
                        );
                    checkForm(targetElm,responseJSON,url);

                }
            } else {
                const errMsgObj = {errMessage: this.responseText};
                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-articles-error").innerHTML,
                        errMsgObj
                    );
            }

        }

        var ajax = new XMLHttpRequest();
        ajax.addEventListener("load", reqListener);
        ajax.open("GET", url, true);
        ajax.send();
}
function checkForm(targetElm,responseJSON,url){
    document.getElementById("commentsForm").onsubmit = function processCommentsFormData(event) {
        event.preventDefault();
        const username = document.getElementById("commentAuthor").value.trim();
        const content = document.getElementById("commentText").value.trim();

        if (username == "" || content == "") {
            window.alert("Napíšte svoje meno a názor");
            return;
        }
        const newOpinion =
            {
                author: username,
                text: content,
            }

        const postReqSettings =
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                },
                body: JSON.stringify(newOpinion)
            };

        fetch(`${url}/comment`, postReqSettings)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
                }
            })
            .then(responseJSON => {
                window.alert("Updated article successfully saved on server");
            })
            .catch(error => {
                window.alert(`Failed to save the updated article on server. ${error}`);

            })
            .finally(() =>{
                let lastComment = (Math.trunc(responseJSON.commentsCount/commentPerPage))*commentPerPage + 1;
                if(lastComment>= responseJSON.commentsCount){
                    lastComment = responseJSON.commentsCount - commentPerPage + 1;
                }
                fetchAndProcessArticle(targetElm,responseJSON.id,responseJSON.offset,responseJSON.totalCount,lastComment,false,responseJSON.ifMy)
            })
    }
}

