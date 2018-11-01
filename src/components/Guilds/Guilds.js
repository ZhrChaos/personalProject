import React from 'react';
import './guilds.css'

export default function Guilds(props) {
      return (
            <div className="guild-container" onClick={() => props.joinRoom(props.guild.guild_id)}>
                  <div className="image-wrapper" >
                        <img src={props.guild.guild_img} alt={props.guild.guild_name} />
                  </div>
                  <h1>{props.guild.guild_name}</h1>
            </div>
      )
}