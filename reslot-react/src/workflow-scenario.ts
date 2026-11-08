export type WorkflowStage = {
 id:string;label:string;role:string;detail:string;exception?:boolean;
 boundary?:string;position?:{x:number;y:number};mobilePosition?:{x:number;y:number};
};
export type WorkflowScene = {
 node?:string;from?:string;duration:number;title:string;output:string;chapter:string;
 issue?:boolean;state?:'partial';contract?:string;
};
export type WorkflowCopy = {
 title:string;simulation:string;play:string;pause:string;replay:string;next:string;
 speed:string;follow:string;overview:string;progress:string;close:string;details:string;
 waiting:string;receiving:string;processing:string;done:string;blocked:string;partial?:string;
 course:string;assignment:string;intro:string;deadline:string;roles:string[];notice:string;
};
export type WorkflowDefinition = {
 id:string;stages:WorkflowStage[];scenes:WorkflowScene[];copy:WorkflowCopy;
 subtitle:string;introLabel:string;environment?:string;
 cardSize?:{width:number;height:number};
 mobileCardSize?:{width:number;height:number};
};
