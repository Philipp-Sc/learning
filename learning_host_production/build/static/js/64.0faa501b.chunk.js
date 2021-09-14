/*! For license information please see 64.0faa501b.chunk.js.LICENSE.txt */
(this.webpackJsonpLearning=this.webpackJsonpLearning||[]).push([[64],{731:function(t,e,r){"use strict";r.r(e),r.d(e,"scopeCss",(function(){return B}));var n=function(){for(var t=0,e=0,r=arguments.length;e<r;e++)t+=arguments[e].length;var n=Array(t),s=0;for(e=0;e<r;e++)for(var o=arguments[e],c=0,a=o.length;c<a;c++,s++)n[s]=o[c];return n},s="-shadowcsshost",o="-shadowcssslotted",c="-shadowcsscontext",a=")(?:\\(((?:\\([^)(]*\\)|[^)(]*)+?)\\))?([^,{]*)",i=new RegExp("(-shadowcsshost"+a,"gim"),u=new RegExp("(-shadowcsscontext"+a,"gim"),l=new RegExp("(-shadowcssslotted"+a,"gim"),h="-shadowcsshost-no-combinator",f=/-shadowcsshost-no-combinator([^\s]*)/,p=[/::shadow/g,/::content/g],g=/-shadowcsshost/gim,d=/:host/gim,v=/::slotted/gim,m=/:host-context/gim,x=/\/\*\s*[\s\S]*?\*\//g,w=/\/\*\s*#\s*source(Mapping)?URL=[\s\S]+?\*\//g,_=/(\s*)([^;\{\}]+?)(\s*)((?:{%BLOCK%}?\s*;?)|(?:\s*;))/g,b=/([{}])/g,S="%BLOCK%",O=function(t,e){var r=W(t),n=0;return r.escapedString.replace(_,(function(){for(var t=[],s=0;s<arguments.length;s++)t[s]=arguments[s];var o=t[2],c="",a=t[4],i="";a&&a.startsWith("{%BLOCK%")&&(c=r.blocks[n++],a=a.substring(S.length+1),i="{");var u={selector:o,content:c},l=e(u);return""+t[1]+l.selector+t[3]+i+l.content+a}))},W=function(t){for(var e=t.split(b),r=[],n=[],s=0,o=[],c=0;c<e.length;c++){var a=e[c];"}"===a&&s--,s>0?o.push(a):(o.length>0&&(n.push(o.join("")),r.push(S),o=[]),r.push(a)),"{"===a&&s++}return o.length>0&&(n.push(o.join("")),r.push(S)),{escapedString:r.join(""),blocks:n}},j=function(t,e,r){return t.replace(e,(function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];if(t[2]){for(var n=t[2].split(","),s=[],o=0;o<n.length;o++){var c=n[o].trim();if(!c)break;s.push(r(h,c,t[3]))}return s.join(",")}return h+t[3]}))},k=function(t,e,r){return t+e.replace(s,"")+r},E=function(t,e,r){return e.indexOf(s)>-1?k(t,e,r):t+e+r+", "+e+" "+t+r},L=function(t,e){return!function(t){return t=t.replace(/\[/g,"\\[").replace(/\]/g,"\\]"),new RegExp("^("+t+")([>\\s~+[.,{:][\\s\\S]*)?$","m")}(e).test(t)},R=function(t,e,r){for(var n,s="."+(e=e.replace(/\[is=([^\]]*)\]/g,(function(t){for(var e=[],r=1;r<arguments.length;r++)e[r-1]=arguments[r];return e[0]}))),o=function(t){var n=t.trim();if(!n)return"";if(t.indexOf(h)>-1)n=function(t,e,r){if(g.lastIndex=0,g.test(t)){var n="."+r;return t.replace(f,(function(t,e){return e.replace(/([^:]*)(:*)(.*)/,(function(t,e,r,s){return e+n+r+s}))})).replace(g,n+" ")}return e+" "+t}(t,e,r);else{var o=t.replace(g,"");if(o.length>0){var c=o.match(/([^:]*)(:*)(.*)/);c&&(n=c[1]+s+c[2]+c[3])}}return n},c=function(t){var e=[],r=0;return{content:(t=t.replace(/(\[[^\]]*\])/g,(function(t,n){var s="__ph-"+r+"__";return e.push(n),r++,s}))).replace(/(:nth-[-\w]+)(\([^)]+\))/g,(function(t,n,s){var o="__ph-"+r+"__";return e.push(s),r++,n+o})),placeholders:e}}(t),a="",i=0,u=/( |>|\+|~(?!=))\s*/g,l=!((t=c.content).indexOf(h)>-1);null!==(n=u.exec(t));){var p=n[1],d=t.slice(i,n.index).trim();a+=((l=l||d.indexOf(h)>-1)?o(d):d)+" "+p+" ",i=u.lastIndex}var v,m=t.substring(i);return a+=(l=l||m.indexOf(h)>-1)?o(m):m,v=c.placeholders,a.replace(/__ph-(\d+)__/g,(function(t,e){return v[+e]}))},C=function t(e,r,n,s,o){return O(e,(function(e){var o=e.selector,c=e.content;return"@"!==e.selector[0]?o=function(t,e,r,n){return t.split(",").map((function(t){return n&&t.indexOf("."+n)>-1?t.trim():L(t,e)?R(t,e,r).trim():t.trim()})).join(", ")}(e.selector,r,n,s):(e.selector.startsWith("@media")||e.selector.startsWith("@supports")||e.selector.startsWith("@page")||e.selector.startsWith("@document"))&&(c=t(e.content,r,n,s)),{selector:o.replace(/\s{2,}/g," ").trim(),content:c}}))},T=function(t,e,r,n,a){var f=function(t,e){var r="."+e+" > ",n=[];return t=t.replace(l,(function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];if(t[2]){for(var s=t[2].trim(),o=t[3],c=r+s+o,a="",i=t[4]-1;i>=0;i--){var u=t[5][i];if("}"===u||","===u)break;a=u+a}var l=a+c,f=""+a.trimRight()+c.trim();if(l.trim()!==f.trim()){var p=f+", "+l;n.push({orgSelector:l,updatedSelector:p})}return c}return h+t[3]})),{selectors:n,cssText:t}}(t=function(t){return j(t,u,E)}(t=function(t){return j(t,i,k)}(t=t.replace(m,c).replace(d,s).replace(v,o))),n);return t=function(t){return p.reduce((function(t,e){return t.replace(e," ")}),t)}(t=f.cssText),e&&(t=C(t,e,r,n)),{cssText:(t=(t=t.replace(/-shadowcsshost-no-combinator/g,"."+r)).replace(/>\s*\*\s+([^{, ]+)/gm," $1 ")).trim(),slottedSelectors:f.selectors}},B=function(t,e,r){var s=e+"-h",o=e+"-s",c=t.match(w)||[];t=function(t){return t.replace(x,"")}(t);var a=[];if(r){var i=function(t){var e="/*!@___"+a.length+"___*/",r="/*!@"+t.selector+"*/";return a.push({placeholder:e,comment:r}),t.selector=e+t.selector,t};t=O(t,(function(t){return"@"!==t.selector[0]?i(t):t.selector.startsWith("@media")||t.selector.startsWith("@supports")||t.selector.startsWith("@page")||t.selector.startsWith("@document")?(t.content=O(t.content,i),t):t}))}var u=T(t,e,s,o);return t=n([u.cssText],c).join("\n"),r&&a.forEach((function(e){var r=e.placeholder,n=e.comment;t=t.replace(r,n)})),u.slottedSelectors.forEach((function(e){t=t.replace(e.orgSelector,e.updatedSelector)})),t}}}]);
//# sourceMappingURL=64.0faa501b.chunk.js.map