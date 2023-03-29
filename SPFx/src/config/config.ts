import HMS from './forms/HMS.json';
import FysiskSikkerhet from './forms/Fysisk sikkerhet.json';
import InformasjonsSikkerhet from './forms/Informasjonssikkerhet.json';
import Personvern from './forms/personvern.json';
import SearchResult from './SearchResult.json';
import { ICalendarStrings } from 'office-ui-fabric-react';

const CalendarStrings: ICalendarStrings = {
    months: ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'],
    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'],
    days: ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'],
    shortDays: ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'],
    goToToday: 'Gå til i dag'
};

export default {forms: [HMS, FysiskSikkerhet, InformasjonsSikkerhet, Personvern], searchResult: SearchResult, calendarString: CalendarStrings};