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
<svelte:body></svelte:body>
<h1>Hello, {data.username}!</h1>
<p>Your favorite color is {data.color}!</p>
<img src="https://unsplash.com/photos/ZdOW9Qd8mQo/download?ixid=MnwxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNjQwMjc2MTI4&force=true&w=640">