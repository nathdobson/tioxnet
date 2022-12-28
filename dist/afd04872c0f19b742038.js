import"./index.css";import playImage from"./assets/images/play.svg";import{GammaDist}from"./random.js";import{Point,Rectangle}from"./geom.js";import{makeSimulation,kStageWidth,kStageHeight}from"./simulation.js";import{Actor,Item,PaintLayer,Simulation}from"./base.js";import{ToggleButton}from"./toggle.js";let jStat=require("jstat");class Animation{constructor(t){this.canvas=t,this.devicePixelRatio=window.devicePixelRatio||1,this.sim=makeSimulation()}revalidate(){let t=this.canvas.getBoundingClientRect();this.canvas.width=t.width*this.devicePixelRatio,this.canvas.height=t.height*this.devicePixelRatio,this.ctx=this.canvas.getContext("2d");let e=this.canvas.width/kStageWidth,i=this.canvas.height/kStageHeight;e<i?(this.ctx.translate(0,this.canvas.height/2),this.ctx.scale(e,e),this.ctx.translate(0,-kStageHeight/2)):(this.ctx.translate(this.canvas.width/2,0),this.ctx.scale(i,i),this.ctx.translate(-kStageWidth/2,0)),this.ctx.beginPath(),this.ctx.rect(0,0,kStageWidth,kStageHeight),this.ctx.clip()}repaint(){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.ctx.beginPath(),this.ctx.moveTo(5,5),this.ctx.rect(5,5,kStageWidth-10,kStageHeight-10),this.ctx.stroke();let t=PaintLayer.enumValues.map((t=>new Set)),e=new Set(this.sim.actors);for(let i of this.sim.actors){let a=i.reorder();if(a)for(let i of a)e.has(i)&&(e.delete(i),t[i.layer.enumOrdinal].add(i))}for(let i of e)console.assert(i.layer,i.constructor.name),t[i.layer.enumOrdinal].add(i);t[PaintLayer.NO_PAINT.enumOrdinal]=new Set;for(let e of t)for(let t of e)this.ctx.save(),t.paint(this.ctx),this.ctx.restore()}elapse(t){this.sim.elapse(t)}}let anim=new Animation(document.getElementById("rootCanvas"));anim.revalidate(),anim.repaint();let time=0,fps=32;window.setInterval((()=>{play.state&&(anim.elapse(time),time+=1/fps,anim.repaint())}),1e3/fps);let play=new ToggleButton,rhs=document.getElementById("rhs");rhs.appendChild(play.button),window.addEventListener("resize",(function(){anim.revalidate(),anim.repaint()}),!1),document.addEventListener("keydown",(t=>{"Space"===t.code&&(play.toggle(),t.stopPropagation(),t.preventDefault())}),!1);