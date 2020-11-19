var express=require("express");
var app=express();
var port=3000;
var bodyParser=require("body-parser");
var passport=require("passport");
var localStrategy=require("passport-local");
var passportLocalMongoose=require("passport-local-mongoose");
var methodOverride=require("method-override");
var middleware=require("./middleware");
var flash=require("connect-flash");
app.use(bodyParser.urlencoded({extended:true}));
app.use(flash());
app.set("view engine","ejs");
//app.use(express.static(path.join(__dirname,"../../src/web/public")));
app.use(express.static("public"));
var mongo=require("mongoose");
mongo.connect("mongodb://localhost/yelpcamp",{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>console.log("Database Connected"))
        .catch((error)=>console.log(error.message))
var a=require("./model/campground");
var b=require("./model/comment");
var User=require("./model/user");
var seedDB=require("./seeds");
//seedDB()
app.use(require("express-session")({
    secret:"This is here",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req,resp,next){
   resp.locals.currentUser=req.user;
   resp.locals.error=req.flash("error");
   resp.locals.success=req.flash("success");
   next();
});
app.use(methodOverride("_method"));
app.get("/",function(req,resp){
    resp.render("landing");
});
app.get("/campground",function(req,resp){
    a.find({},function(err,campground){
       if(err)
       {
           console.log(err.message);
       }
       else
       {
           resp.render("index",{campground:campground});
       }
    });
    
});
app.get("/campground/new",isLoggedIn,function(req,resp){
    resp.render("new");
});
app.get("/campground/:id",function(req,resp){
    a.findById(req.params.id).populate("comments").exec(function(err,campground){
       if(err)
       {
           console.log(err);
       }
       else
       {
           resp.render("show",{campground:campground});
       }
    }); 
});
app.post("/campground",function(req,resp){
    var name=req.body.name;
    var price=req.body.price;
    var image=req.body.image;
    var description=req.body.description;
    var myObject={
        id:req.user,
        username:req.user.username
    };
    var author=new Object(myObject);
    var object={name:name, price:price, image:image, description:description, author:author};
    a.create(object,function(err,b){
       if(err)
       {
         console.log(err.message);  
       }
       else
       {
          resp.redirect("/campground");
       }
    });
    
});
app.get("/campground/:id/comments/new",isLoggedIn,function(req,resp){
   a.findById(req.params.id,function(err,campground){
       if(err)
       {
           console.log(err.message);
       }
       else
       {
           resp.render("newfile",{campground:campground});
       }
   }) 
    
    
});
app.post("/campground/:id/comments",isLoggedIn,function(req,resp){
    a.findById(req.params.id,function(err,campground){
        if(err)
        {
            console.log(err.message);
            resp.redirect("/campground");
        }
        else
        {
            var data=req.body.comment;
            var author=new Object({
                        id:req.user._id,
                        username:req.user.username
                     });
            data.author=author;
            b.create(data,function(err,comment){
                if(err)
                {
                    console.log(err.message)
                }
                else
                {
                     campground.comments.push(comment);
                     campground.save();
                     resp.redirect("/campground/"+campground._id);
                }
            })
        }
    })
})
app.get("/register",function(req,resp){
    resp.render("register");
});
app.post("/register",function(req,resp){
   User.register(new User({username:req.body.username}),req.body.password,function(err,user){
       if(err)
       {
           req.flash("error",err.message);
           resp.render("register");
       }
       else
       {
           passport.authenticate("local")(req,resp,function(){
               req.flash("success","Welcome to YelpCamp "+user.username);
               resp.redirect("/campground");
           })
       }
   }) 
});
app.get("/login",function(req,resp){
    resp.render("login");
})
app.post("/login",passport.authenticate("local",{
    successRedirect:"/campground",
    failureRedirect:"/login"
}),function(req,resp){
    
});
app.get("/logout",function(req,resp){
    req.logout();
    req.flash("success","Logged you out!");
    resp.redirect("/campground");
});

app.get("/campground/:id/edit",checkCampgroundOwnership,function(req,resp){ 
    a.findById(req.params.id,function(err,data){
         resp.render("edit",{campground:data});
     });         
});
app.put("/campground/:id",checkCampgroundOwnership,function(req,resp){
    a.findByIdAndUpdate(req.params.id,req.body.a,function(err,updatedData){
        if(err)
        {
            resp.redirect("/campground");
        }
        else
        {
           resp.redirect("/campground/"+req.params.id);
        }
    });
    
});
app.delete("/campground/:id",checkCampgroundOwnership,function(req,resp){
    a.findByIdAndRemove(req.params.id,function(err){
        if(err)
        {
            resp.redirect("/campground");
        }
        else
        {
            resp.redirect("/campground");
        }
    })
});
app.get("/campground/:id/comments/:comment_id/edit",checkCommentCampgroundOwnership,function(req,resp){
    b.findById(req.params.comment_id,function(err,foundComment){
       if(err)
       {
           console.log(err.message);
       }
       else
       {
           //console.log(foundComment)
           resp.render("editComment",{campground_id:req.params.id,comment:foundComment});
       }
    });
});
app.put("/campground/:id/comments/:comment_id",checkCommentCampgroundOwnership,function(req,resp){
    b.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,data){
        if(err)
        {
            resp.redirect("back");
        }
        else
        {
            resp.redirect("/campground/"+req.params.id);
        }
    });
});
app.delete("/campground/:id/comments/:comment_id",checkCommentCampgroundOwnership,function(req,resp){
   b.findByIdAndRemove(req.params.comment_id,function(err,data){
      if(err)
      {
          resp.redirect("back");
      }
      else
      {
          resp.redirect("/campground/"+req.params.id);
      }
   });
});
function isLoggedIn(req,resp,next)
{
    if(req.isAuthenticated())
    {
        return next();
    }
    req.flash("error","Please login first!");
    resp.redirect("/login");
}
function checkCampgroundOwnership(req,resp,next)
{
    if(req.isAuthenticated())
    {
        a.findById(req.params.id,function(err,data){
        if(err)
        {
          //req.flash("error","Campground not found");
          resp.redirect("back"); 
        }
        else
        {
            if(data.author.id.equals(req.user._id))
            {
                next();
            }
            else
            {
                req.flash("error","You don't have permission to do that");
            }
        }
    });
    
    }
    else
    {
        req.flash("error","Please login first!");
        resp.redirect("back");
    }
}
function checkCommentCampgroundOwnership(req,resp,next)
{
    if(req.isAuthenticated())
    {
        b.findById(req.params.comment_id,function(err,foundData){
        if(err)
        {
            console.log("->"+err.message);
            resp.redirect("back"); 
        }
        else
        {
            if(foundData.author.id.equals(req.user._id))
            {
                next();
            }
            else
            {
                req.flash("error","You don't have permission to do that");
                resp.redirect("back");
            }
        }
    });
    
    }
    else
    {
        req.flash("error","Please login first!");
        resp.redirect("back");
    }
}
app.listen(port,function(){
    console.log("Server has started");
});

/*var campground=[
        
        {name:"Salmon Creek",image:"https://www.exoticamp.com/wp-content/uploads/2018/04/29983061_640965312923162_4735239029177375606_o-700x525.jpg"},
        {name:"Granite Hill",image:"https://invinciblengo.org/photos/event/slider/manali-girls-special-adventure-camp-himachal-pradesh-1xJtgtx-1440x810.jpg"},
        {name:"Mountain",image:"https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRgAPIm-XQa1FMcm1Z9WS9MDa8k-RXy1uTWlA&usqp=CAU"}
    ];*/