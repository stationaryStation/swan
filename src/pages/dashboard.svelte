<script lang="ts">
    var loggedIn : boolean = true;
    var data : any = {
        username: "default",
        isManager: false,
        isTester: false,
        isAdmin: false,
        color: "default"
    };
    if (loggedIn) {
        data.username = "ABCDEF"
        data.isManager = false;
        data.isTester = true;
        data.isAdmin = true;
        data.color = "pink";
    }else{
        data.username = undefined;
    }
    
   
</script>

<h1>Hello, {data.username}!</h1>
<p>Your favorite color is {data.color}!</p>