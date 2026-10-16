// Country list used by the dropdown and by the HubSpot sync. The code (value) is what HubSpot receives.
// Corrections to the supplied data: "Bruneİ" -> "Brunei", and AS is "American Samoa" (it was a second "Samoa").
const RAW = `AF|Afghanistan
AL|Albania
DZ|Algeria
AD|Andorra
AO|Angola
AI|Anguilla
AQ|Antarctica
AG|Antigua and Barbuda
AR|Argentina
AM|Armenia
AW|Aruba
AU|Australia
AT|Austria
AZ|Azerbaijan
BS|Bahamas
BH|Bahrain
BD|Bangladesh
BB|Barbados
BY|Belarus
BE|Belgium
BZ|Belize
BJ|Benin
BM|Bermuda
BT|Bhutan
BO|Bolivia
BQ|Bonaire, Sint Eustatius and Saba
BA|Bosnia and Herzegovina
BW|Botswana
BV|Bouvet Island
BR|Brazil
IO|British Indian Ocean Territory
BN|Brunei
BG|Bulgaria
BF|Burkina Faso
BI|Burundi
KH|Cambodia
CM|Cameroon
CA|Canada
CV|Cape Verde
KY|Cayman Islands
CF|Central African Republic
TD|Chad
CL|Chile
CN|China
CX|Christmas Island
CC|Cocos (Keeling) Islands
CO|Colombia
KM|Comoros
CG|Congo
CK|Cook Islands
CR|Costa Rica
CI|Côte d'Ivoire
HR|Croatia
CU|Cuba
CW|Curaçao
CY|Cyprus
CZ|Czechia
CD|Democratic Republic of the Congo
DK|Denmark
DJ|Djibouti
DM|Dominica
DO|Dominican Republic
EC|Ecuador
EG|Egypt
SV|El Salvador
GQ|Equatorial Guinea
ER|Eritrea
EE|Estonia
SZ|Eswatini
ET|Ethiopia
FK|Falkland Islands
FO|Faroe Islands
FJ|Fiji
FI|Finland
FR|France
GF|French Guiana
PF|French Polynesia
TF|French Southern Territories
GA|Gabon
GM|Gambia
GE|Georgia
DE|Germany
GH|Ghana
GI|Gibraltar
GR|Greece
GL|Greenland
GD|Grenada
GP|Guadeloupe
GU|Guam
GT|Guatemala
GG|Guernsey
GN|Guinea
GW|Guinea-Bissau
GY|Guyana
HT|Haiti
HM|Heard Island and McDonald Islands
VA|Holy See
HN|Honduras
HK|Hong Kong
HU|Hungary
IS|Iceland
IN|India
ID|Indonesia
IR|Iran
IQ|Iraq
IE|Ireland
IM|Isle of Man
IL|Israel
IT|Italy
JM|Jamaica
JP|Japan
JE|Jersey
JO|Jordan
KZ|Kazakhstan
KE|Kenya
KI|Kiribati
KW|Kuwait
KG|Kyrgyzstan
LA|Laos
LV|Latvia
LB|Lebanon
LS|Lesotho
LR|Liberia
LY|Libya
LI|Liechtenstein
LT|Lithuania
LU|Luxembourg
MO|Macao
MG|Madagascar
MW|Malawi
MY|Malaysia
MV|Maldives
ML|Mali
MT|Malta
MH|Marshall Islands
MQ|Martinique
MR|Mauritania
MU|Mauritius
YT|Mayotte
MX|Mexico
FM|Micronesia
MD|Moldova
MC|Monaco
MN|Mongolia
ME|Montenegro
MS|Montserrat
MA|Morocco
MZ|Mozambique
MM|Myanmar
NA|Namibia
NR|Nauru
NP|Nepal
NL|Netherlands
NC|New Caledonia
NZ|New Zealand
NI|Nicaragua
NE|Niger
NG|Nigeria
NU|Niue
NF|Norfolk Island
KP|North Korea
MK|North Macedonia
NCY|Northern Cyprus
MP|Northern Mariana Islands
NO|Norway
OM|Oman
PK|Pakistan
PW|Palau
PS|Palestine
PA|Panama
PG|Papua New Guinea
PY|Paraguay
PE|Peru
PH|Philippines
PN|Pitcairn
PL|Poland
PT|Portugal
PR|Puerto Rico
QA|Qatar
RE|Réunion
RO|Romania
RU|Russia
RW|Rwanda
BL|Saint Barthélemy
SH|Saint Helena, Ascension and Tristan da Cunha
KN|Saint Kitts And Nevis
LC|Saint Lucia
MF|Saint Martin (French part)
PM|Saint Pierre and Miquelon
VC|Saint Vincent and the Grenadines
AS|American Samoa
WS|Samoa
SM|San Marino
ST|Sao Tome and Principe
SA|Saudi Arabia
SN|Senegal
RS|Serbia
SC|Seychelles
SL|Sierra Leone
SG|Singapore
SX|Sint Maarten (Dutch part)
SK|Slovakia
SI|Slovenia
SB|Solomon Islands
SO|Somalia
ZA|South Africa
GS|South Georgia and the South Sandwich Islands
KR|South Korea
SS|South Sudan
ES|Spain
LK|Sri Lanka
SD|Sudan
SR|Suriname
SJ|Svalbard and Jan Mayen
SE|Sweden
CH|Switzerland
SY|Syria
TW|Taiwan
TJ|Tajikistan
TZ|Tanzania
TH|Thailand
TL|Timor-Leste
TG|Togo
TK|Tokelau
TO|Tonga
TT|Trinidad And Tobago
TN|Tunisia
TR|Türkiye
TM|Turkmenistan
TC|Turks and Caicos Islands
TV|Tuvalu
UG|Uganda
UA|Ukraine
AE|United Arab Emirates
GB|United Kingdom
UM|United States Minor Outlying Islands
US|United States of America
UY|Uruguay
UZ|Uzbekistan
VU|Vanuatu
VE|Venezuela
VN|Viet nam
VG|Virgin Islands (British)
VI|Virgin Islands (U.S.)
WF|Wallis and Futuna
EH|Western Sahara
YE|Yemen
ZM|Zambia
ZW|Zimbabwe`;

export type Country = { value: string; name: string };
export const COUNTRIES: Country[] = RAW.split("\n").map((l) => {
  const [value, ...rest] = l.split("|");
  return { value, name: rest.join("|") };
});

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const byCode = new Map(COUNTRIES.map((c) => [c.value.toLowerCase(), c]));
const byName = new Map(COUNTRIES.map((c) => [norm(c.name), c]));

// Common alternative spellings the AI (or a card) may use.
const ALIASES: Record<string, string> = {
  turkey: "TR", turkiye: "TR",
  usa: "US", "u s a": "US", "u s": "US", america: "US", "united states": "US", "united states of america": "US",
  uk: "GB", "u k": "GB", "great britain": "GB", britain: "GB", england: "GB", scotland: "GB", wales: "GB", "northern ireland": "GB",
  uae: "AE", "u a e": "AE", emirates: "AE",
  "czech republic": "CZ", vietnam: "VN", "viet nam": "VN",
  "russian federation": "RU", korea: "KR", "republic of korea": "KR", "korea republic of": "KR",
  "south korea": "KR", "north korea": "KP", "democratic peoples republic of korea": "KP",
  "iran islamic republic of": "IR", "islamic republic of iran": "IR",
  vatican: "VA", "vatican city": "VA", "holy see vatican city state": "VA",
  burma: "MM", "ivory coast": "CI", "cote divoire": "CI", swaziland: "SZ", macedonia: "MK",
  "east timor": "TL", macau: "MO", "cabo verde": "CV", "brunei darussalam": "BN",
  "republic of moldova": "MD", "syrian arab republic": "SY", "lao pdr": "LA", "lao peoples democratic republic": "LA",
  "united republic of tanzania": "TZ", "drc": "CD", "dr congo": "CD", "democratic republic of congo": "CD",
  "congo kinshasa": "CD", "republic of the congo": "CG", "congo brazzaville": "CG",
  "palestinian territory": "PS", "state of palestine": "PS", "the netherlands": "NL", holland: "NL",
  "the bahamas": "BS", "the gambia": "GM", "bolivia plurinational state of": "BO", "venezuela bolivarian republic of": "VE",
  "northern cyprus": "NCY", "turkish republic of northern cyprus": "NCY", trnc: "NCY",
  "taiwan province of china": "TW", "hong kong sar": "HK", "peoples republic of china": "CN", prc: "CN",
};

/** Match free text (a country name, alias, or code) to an entry in the list. Returns null when unsure. */
export function matchCountry(text: string | null | undefined): Country | null {
  if (!text) return null;
  const n = norm(text);
  if (!n) return null;
  if (n.length <= 3 && byCode.has(n.replace(/ /g, ""))) return byCode.get(n.replace(/ /g, ""))!;
  const alias = ALIASES[n];
  if (alias) return byCode.get(alias.toLowerCase()) ?? null;
  return byName.get(n) ?? null;
}

/** What gets sent to HubSpot: the list's code when the text matches, otherwise the text unchanged. */
export const countryForHubSpot = (text: string | null | undefined) => matchCountry(text)?.value ?? text ?? null;

/** Human-readable name for a stored value (code or text). */
export const countryName = (text: string | null | undefined) => matchCountry(text)?.name ?? text ?? null;
