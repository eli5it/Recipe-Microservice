# Recipe-Microservice

Communication Contract

To Programmatically request data, you will have to send a stringified JSON array of ingredients to the zeromq server running the microservice. What follows below is example code for doing so while utilizing Node.js.

    const ingredients = JSON.stringify(["chickpea"]);
    await sock.send(ingredients);

To Programatically receive data, from the microservice, you will have to utilize the zeromq receive method (which is called recv within the python library). In order to work with the received data, it is necessary to convert it from string representation to JSON one. This conversion is performed in the below sample Node.js code, with the JSON.parse method.

    const [result] = await sock.receive();
    const data = JSON.parse(result.toString());
    console.log(data);


    <img width="688" alt="image" src="https://github.com/user-attachments/assets/51dba624-fbbc-4344-abe3-b99686cb08f5">



**Mitigation Plan**

    A. David Skaggs  
    
    B. This microservice is completed  
    
    C. NA, the microservice is completed.  
    
    D. My teammate should access this microservice from this repo on github. They will 
       want to utilize the server.mjs file to get the zeromq server up and running.  
    
    E. If my teammate cannot access my microservice than I can be available to help them. 
       I work 3 days a week for 10  hours a day, with a rotating schedule. On my work days, 
       I will generally be avaiable after 730PM EST. On my non-work days, I am  
       available at almost any time. Messaging me on discord is an effective way to get help.  
    
    F. I would prefer that my teammate contact me within a week if they are unable to call 
       or acccess this microservice.  
    
    G. My teammate should be aware that there is a rate limit on the spoonacular API that 
       is utilized by this microservice. Under the free plan, there are a max of 60 requests 
       in 1 minute, and there is also a daily quota that limits usage to about 150 requests. 
       I'd like my teammate to sign up for their own API account, and fill out their API key 
       in the .env file provided in this repo. At the time being my teammate shouldn't have 
       to worry much about surpassing quota limits, but if they want to scale up their main 
       program so that it receives large volumes of requests, then it would be necessary to sign
       up for a paid subscription, or implement caching.
    

 
