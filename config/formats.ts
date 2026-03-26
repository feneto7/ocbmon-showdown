// Note: This is the list of formats
// The rules that formats use are stored in data/rulesets.ts
/*
If you want to add custom formats, create a file in this folder named: "custom-formats.ts"

Paste the following code into the file and add your desired formats and their sections between the brackets:
--------------------------------------------------------------------------------
// Note: This is the list of formats
// The rules that formats use are stored in data/rulesets.ts

export const Formats: FormatList = [
];
--------------------------------------------------------------------------------

If you specify a section that already exists, your format will be added to the bottom of that section.
New sections will be added to the bottom of the specified column.
The column value will be ignored for repeat sections.
*/

export const Formats: import('../sim/dex-formats').FormatList = [

	

	// OCBMONS
	///////////////////////////////////////////////////////////////////

	{
		section: "OCB",
		column: 1,
	},
	{
		name: "[Gen 9] OCBMons",
		mod: 'gen9ocb',
		ruleset: [
			'Team Preview', 'HP Percentage Mod', 'Cancel Mod', 'Endless Battle Clause',
			'Sleep Clause Mod', 'OHKO Clause',
			'+Custom', '+Nonexistent', 'Dynamax Clause', 'Elite Redux Innates', 'Double Type Boost',
		],
	},
	


];
