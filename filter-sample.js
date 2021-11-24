
function filter(entry) {
	/* entry object fields:
	 *     sec     : string  Section name
	 *     addr    : number  Address of the symbol
	 *     size    : number  Size of the symbol
	 *     library : string  Source library name or empty string if file was linked directly
	 *     file    : string  Source object file name
	 *     memory  : string  Memory name where the symbol is located
	 *
	 * filter() function returns:
	 *     - false to completely ignore this entry in the report.
	 *     - true to add this entry to the report as uncategorized.
	 *     - string containing category. Subcategories are separated by ';' sign (without whitespace).
	 */

	if (entry.sec.match(/^(\.debug|.comment|\.ARM\.attributes)/)) return false;

	if (entry.library.startsWith('modules/nrf/subsys/nrf_rpc')) return 'rpc;nrf_rpc;nrf';
	if (entry.library.startsWith('modules/nrfxlib/nrfxlib/nrf_rpc')) return 'rpc;nrf_rpc;nrfxlib';
	if (entry.library.startsWith('modules/nrf/subsys/bluetooth/rpc')) return 'rpc;bt_rpc';
	if (entry.library.startsWith('modules/open-amp')) return 'rpmsg;open-amp';
	if (entry.library.startsWith('modules/libmetal')) return 'rpmsg;libmetal';
	if (entry.library.startsWith('modules/tinycbor')) return 'tinycbor';
	if (entry.file.startsWith('rpmsg_')) return 'rpmsg;service';

	return true;
}

