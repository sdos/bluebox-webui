"""
    Project Bluebox
    2015, University of Stuttgart, IPVS/AS
"""
"""
    Project Bluebox 

    Copyright (C) <2015> <University of Stuttgart>

    This software may be modified and distributed under the terms
    of the MIT license.  See the LICENSE file for details.
"""

class InternalStorageManager:

    CONTAINER_PREFIX = "_internal_ "
    
    def __init__(self, swift):
        self.swift = swift
    
    # stores the specified key value pair to the specified internal 
    def store_data(self, container_name, key, value):
        internal_cont_name = self.CONTAINER_PREFIX + container_name
        containers = self.swift.get_container_list()[1]
        if internal_cont_name not in [c.get("name") for c in containers]:
            self.swift.create_container(internal_cont_name)
            
        self.swift.object_upload(key, internal_cont_name, value, {})
    
    # returns the data for the specified key or None
    def get_data(self, container_name, key):
        internal_cont_name = self.CONTAINER_PREFIX + container_name
        try:
            data = self.swift.conn.get_object(internal_cont_name, key)[1] # TODO Nicht die API des swift clients umgehen (i.e. kein zugriff auf conn)
            return data.decode("latin-1") # assume string
        except Exception:
            return None
    
    def get_keys(self, container_name):
        internal_cont_name = self.CONTAINER_PREFIX + container_name
        try:
            tmp = self.swift.get_object_list(internal_cont_name)[1]
        except Exception: # container does not exist
            return []
        
        return [entry.get("name") for entry in tmp]
    
    def remove_data(self, container_name, key):
        internal_cont_name = self.CONTAINER_PREFIX + container_name
        self.swift.delete_object(internal_cont_name, key)
