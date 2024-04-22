import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const Summary = (props) => {
  return (
    <div className="row">
      {props.summary.length > 0
        ? props.summary.map((item, idx) => {
            return (
              <div className="col-md-4" key={idx}>
                <div className="dataContainerBox summaryBox">
                  <div>
                    <p className="contentTitle">{item.name}</p>
                    <p className={`summaryCount summaryColor${idx}`}>
                      {item.count}
                    </p>
                  </div>
                  <div>
                    <FontAwesomeIcon
                      icon={props.displayIcons(idx)}
                      className={`summaryIcons summaryColor${idx}`}
                    />
                  </div>
                </div>
              </div>
            );
          })
        : null}
    </div>
  );
};

export default Summary;
