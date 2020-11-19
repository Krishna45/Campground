var mongo=require("mongoose");
var Campground=require("./model/campground");
var Comment=require("./model/comment");
var data=[
        {name:"Salmon Creek",image:"https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500", description:"Campers arrive and the real work begins. The camp is split into groups and counselors are assigned a specific group of campers. Each day is then scheduled to include activities and meals and the camp may hold a parent's program at the end of the summer right before the kids leave."},
        {name:"Granite Hill",image:"https://invinciblengo.org/photos/event/slider/manali-girls-special-adventure-camp-himachal-pradesh-1xJtgtx-1440x810.jpg",description:"Campers arrive and the real work begins. The camp is split into groups and counselors are assigned a specific group of campers. Each day is then scheduled to include activities and meals and the camp may hold a parent's program at the end of the summer right before the kids leave."},
        {name:"Mountain",image:"https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRgAPIm-XQa1FMcm1Z9WS9MDa8k-RXy1uTWlA&usqp=CAU", description:"Campers arrive and the real work begins. The camp is split into groups and counselors are assigned a specific group of campers. Each day is then scheduled to include activities and meals and the camp may hold a parent's program at the end of the summer right before the kids leave."}
]
function seedDB(){
    Campground.remove({},function(err){ //remove all the existing camps
        if(err)
        {
            console.log(err.message);
        }
        else
        {
        data.forEach(function(seed){
        Campground.create(seed,function(err,b){
            if(err)
            {
                console.log(err.message);
            }
            else
            {
                console.log(b); 
            }
        })
    });
    }
    });
   
}
module.exports=seedDB;
