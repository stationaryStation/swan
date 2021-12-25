<script lang=ts>
    import { supabase } from '../supabaseClient.js';
    import '../styles/main.css'
    let loading = false;
    let email;
    const handleLogin = async () => {
        try {
            loading = true;
            const {error} = await supabase.auth.signIn({email});
            if (error) throw error
            alert('Check your email for the login link!');
        } catch (error) {
            alert(error.error_description || error.message)
        } finally {
            loading = false;
        }
    }
</script>
<div class="background">
    <div class="shape"></div>
    <div class="shape"></div>
    <div class="shape"></div>
<form class="row flex flex-center container" on:submit|preventDefault={handleLogin}>
    <div class="col-6 form-widget">
        <h3 class="header">Login</h3>
        <p class="description">Sign in via magic link with your email below</p>
        <div>
            <input
                class="inputField"
                type="email"
                placeholder="Your Email"
                bind:value={email}
                />
        </div>
       <div>
           <input type="submit" class='button block btn' value={loading ? "loading" : "Send magic link"} disabled={loading} />
       </div> 
    </div>
</form>
</div>
