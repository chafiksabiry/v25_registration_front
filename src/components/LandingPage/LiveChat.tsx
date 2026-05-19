import { useEffect } from 'react';

export function LiveChat() {
  useEffect(() => {
    // Create Zoho SalesIQ script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'zsiqscript';
    script.defer = true;
    script.innerHTML = `
      var $zoho=$zoho || {};
      $zoho.salesiq = $zoho.salesiq || {
        widgetcode: "YOUR_WIDGET_CODE",
        values: {},
        ready: function() {}
      };
      
      var d=document;
      s=d.createElement("script");
      s.type="text/javascript";
      s.id="zsiqscript";
      s.defer=true;
      s.src="https://salesiq.zoho.com/widget";
      t=d.getElementsByTagName("script")[0];
      t.parentNode.insertBefore(s,t);
    `;

    // Add script to document
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      // Remove the script when component unmounts
      const scriptElement = document.getElementById('zsiqscript');
      if (scriptElement) {
        scriptElement.remove();
      }
      // Remove any Zoho chat widgets
      const widgetElements = document.querySelectorAll('[id^="zsiq_"]');
      widgetElements.forEach(element => element.remove());
    };
  }, []);

  return null;
}
