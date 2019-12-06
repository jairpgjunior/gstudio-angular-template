import React from "react";
export default class SampleComponent extends React.Component {
  render() {
    return (
       <div id="content">
         <img
           width="100"
           alt="gStudio files"
           src="https://gstudioapp.com/static/Pasta-gStudio-01-d0e59dc02ba2cc908f20bc3fc8960b9c.png"
         />
         <h1>Your project is built on ./src/gstudio</h1>
         <p>Render some component to see the result!</p>
         <small>
           Open index.js and change it to import one of your components.
         </small>
       </div>
     );
   }
 }           