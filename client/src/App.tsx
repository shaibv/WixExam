import React from 'react';
import './App.scss';
import {createApiClient, Ticket} from './api';
import { TicketComp } from './components/Ticket';
import { TicketsNumber } from './components/TicketsNumber';

export type AppState = {
	tickets: Ticket[],
	hiddenTickets: string[],
	search: string;
}

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {

	state: AppState = {
		search: '',
		tickets: [],
		hiddenTickets: []
	}

	searchDebounce: any = null;

	async componentDidMount() {
		this.setState({
			tickets: await api.getTickets()
		});
	}

	hideTicket = (ticket:Ticket) => {
		const hiddenTickets = this.state.hiddenTickets.slice();
		hiddenTickets.push(ticket.id);
		this.setState({hiddenTickets});
	}
	restoreTickets = () => {
		this.setState({hiddenTickets:[]});
	}

	renderTickets = (tickets: Ticket[]) => {

		const filteredTickets = tickets
			.filter((t) => (t.title.toLowerCase() + t.content.toLowerCase()).includes(this.state.search.toLowerCase()));


		return (<ul className='tickets'>
			{filteredTickets.map((ticket) => (<TicketComp key={ticket.id} hideTicket={this.hideTicket} ticket={ticket}/>))}
		</ul>);
	}

	onSearch = async (val: string, newPage?: number) => {
		
		clearTimeout(this.searchDebounce);

		this.searchDebounce = setTimeout(async () => {
			this.setState({
				search: val
			});
		}, 300);
	}

	render() {	
		const {tickets , hiddenTickets} = this.state;
		const shownTickets = tickets.filter(ticket => !hiddenTickets.find(hidden => hidden === ticket.id) );
		return (<main>
			<h1>Tickets List</h1>
			<header>
				<input type="search" placeholder="Search..." onChange={(e) => this.onSearch(e.target.value)}/>
			</header>
			{shownTickets ? <TicketsNumber shownNumber={shownTickets.length} hiddenNumber={hiddenTickets.length} restore={this.restoreTickets}/> : null}	
			{shownTickets ? this.renderTickets(shownTickets) : <h2>Loading..</h2>}
		</main>)
	}
}

export default App;