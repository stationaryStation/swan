<script>
import { supabase } from './supabaseClient.js';
import {user} from './sessionStore'
import './styles/main.css'
import Nav from './lib/nav.svelte'
import Dashboard from './pages/dashboard.svelte';
import Login from './pages/login.svelte'
import Profile from './pages/profile.svelte'
import {Router, Route} from 'svelte-routing';
export let url = '';

user.set(supabase.auth.user())
supabase.auth.onAuthStateChange((_, session) => {
    user.set(session.user)
})
</script>

{#if $user}
    <Nav />
{/if}

<Router url="{url}">
    <div class="content">
        {#if $user}
            <Profile /> 
        {:else}
            <Login />
        {/if}
    </div>
</Router>
