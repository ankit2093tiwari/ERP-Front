// How do I make the first letter of a string uppercase in JavaScript

export function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

const arrOptions =  [
    {value : 1, label : 'Hindi'},
    {value : 2, label : 'English'},
    {value : 3, label : 'Gujarati'},
    {value : 4, label : 'Marathi'},
    {value : 5, label : 'Bengali'},
    {value : 6, label : 'Kannada'},
    {value : 7, label : 'Malayalam'},
    {value : 8, label : 'Odia'},
    {value : 9, label : 'Sanskrit'},
    {value : 10, label : 'Tamil'},
    {value : 11, label : 'Telugu'},
    {value : 12, label : 'Urdu'}

]
export const motherTongueOptions = () => {
    return [
        {value : 1, label : 'Hindi'},
        {value : 2, label : 'English'},
        {value : 3, label : 'Gujarati'},
        {value : 4, label : 'Marathi'},
        {value : 5, label : 'Bengali'},
        {value : 6, label : 'Kannada'},
        {value : 7, label : 'Malayalam'},
        {value : 8, label : 'Odia'},
        {value : 9, label : 'Sanskrit'},
        {value : 10, label : 'Tamil'},
        {value : 11, label : 'Telugu'},
        {value : 12, label : 'Urdu'}    
    ];
}