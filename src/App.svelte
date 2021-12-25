<script lang="ts">
import {Router, Route} from 'svelte-routing';
import './styles/main.css'
import Nav from './lib/nav.svelte'
import Dashboard from './pages/dashboard.svelte';
export let url = '';
</script>

<svelte:body></svelte:body>
<Nav />
<Router {url}>
    <div class="content">
        <Route path="dashboard" component={Dashboard} />
        <Dashboard />
    </div>
</Router>

