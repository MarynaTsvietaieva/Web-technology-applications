
export default function processOpnFrmData(event){
    event.preventDefault();
    const username = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    let url = document.getElementById("url").value.trim();
    if(url == ""){
        url = "žiadne dodatky";
    }
    const cervene = document.getElementById("cervene").checked;
    const biele = document.getElementById("biele").checked;
    let vino;
    if(cervene){
        vino = "cervene";
    }
    if(biele){
        vino = "biele";
    }

    let oblasty = [];
    const malokarpat = document.getElementById("malokarpat").checked;
    if(malokarpat){
        oblasty.push(" Malokarpatská");
    }
    const uzna = document.getElementById("uzna").checked;
    if(uzna){
        oblasty.push(" Južno-slovenská");
    }
    const nitra = document.getElementById("nitra").checked;
    if(nitra){
        oblasty.push(" Nitrianská");
    }
    const vychod = document.getElementById("vychod").checked;
    if(vychod){
        oblasty.push(" Východoslovenská");
    }
    if(oblasty == null || oblasty == ""){
        oblasty = "žiadnu z uvedených";
    }
    const nazor = document.getElementById("nazor").value.trim();
    let keys = document.getElementById("keys").value.trim();
    if(keys == ""){
        keys = "žiadne";
    }

    if(username=="" || email=="" || nazor==""){
        window.alert("Napíšte svoje meno, email a názor");
        return;
    }

    const newOpinion =
        {
            name: username,
            mail: email,
            additions: url,
            opinion: nazor,
            wine: vino,
            areas: oblasty,
            keys: keys,
            created: new Date()
        };

    console.log("Nový názor:\n "+JSON.stringify(newOpinion));

    let opinions = [];

    if(localStorage.myComments){
        opinions=JSON.parse(localStorage.myComments);
    }

    opinions.push(newOpinion);
    localStorage.myComments = JSON.stringify(opinions);

    window.location.hash="#opinions";

}
