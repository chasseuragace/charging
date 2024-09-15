# booking status 
-  pending , complete , in_progress, scheduled, cancelled, 


# queries 
- find entities with available charging points 
- find all entities with charging points 
- find charging point status for given entity ids 

# use cases 
- list all entities with registered charging points 
- get charging point of listed entities 
- get charginf points of given entity 


# flow 
- find nerby charging stations 
    - input : coordinates 
    - output : [entityId]
- find charging points of nearby stations (NCP)
    - input : [entityId]
    - database : charger 
    - select * form ChargingPoints where vendor_id = given_id
    - output : [entityId : [chargerJson] ]
- find status of listed charging points 
    - statuses : [in_progress, scheduled] 
    - input : [chargerId , & statuses ]
    - output : [ booking list ]
    - activity : [ if the list has data , use the status form data , else set as  available ] 

- filter  charging points by status 
