import React from 'react';
import './JoinGuildList.css'

export default function JoinGuildList(props) {
      return (
            <div className="container-guild" onClick={() => props.handleAdd(props.guild.guild_id)}>
                  <div className="image-wrapper" >
                        <img src={props.guild.guild_img} alt={props.guild.guild_name} className="guild-image" />
                  </div>
                  <h1>{props.guild.guild_name}</h1>
            </div>
      )
}