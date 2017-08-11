// 动态改变名字颜色

function Dec2Any(str,num){
    if(!/\d+/.test(str)) return NaN;
    if(!/\d+/.test(num)) return NaN;
    var num=eval(num);
    if(num>36 || num<2) return NaN;
    var the_str="0123456789abcdefghijklmnopqrstuvwxyz";
    var str=eval(str);
    var residue=0;
    var result="";
    while(true){
        residue=str%num;
        result = the_str.charAt(residue) + result;
        if(str<num) break;
        str=Math.floor(str/num);
    }

    return(result);
}
function GetRandomNum(Min,Max){
    var Range = Max - Min;
    var Rand = Math.random();
    return(Min + Math.round(Rand * Range));
}
function GetHex(){
    var the_Hex = Dec2Any(GetRandomNum(0,255),16);
    if(the_Hex.length==1) the_Hex = "0" + the_Hex;
    return the_Hex;
}
function GetHexColor(){
    return GetHex() + GetHex() +GetHex();
}
function chcolor(){
    document.getElementById("portfolio-name").style.color="#"+GetHexColor();
}
setInterval("chcolor()",1000);//每1称执行一次
