pragma solidity ^0.4.18;

import './interfaces/IERC20.sol';
import './PolyToken.sol';
import './SafeMath.sol';
import './Ownable.sol';

/**
 * @title POLY token initial distribution
 *
 * @dev Distribute investor, airdrop, reserve, and founder tokens
 */
contract PolyDistribution is Ownable {
  using SafeMath for uint256;

  PolyToken public POLY;

  uint256 private constant decimals = 10**uint256(18);
  enum AllocationType { PRESALE, FOUNDER, AIRDROP, ADVISOR, RESERVE }

  uint256 public AVAILABLE_TOTAL_SUPPLY       = 1000000000 * decimals;

  uint256 public AVAILABLE_PRESALE_SUPPLY     = 2625000000 * decimals; // 100% Release Jan 24th 2018
  uint256 public AVAILABLE_FOUNDER_SUPPLY     =  150000000 * decimals; // 25% Release Jan 24th, 2019 + 25% release yearly after
  uint256 public AVAILABLE_AIRDROP_SUPPLY     =  100000000 * decimals; // 10% Released Jan 24th, 2019 + 10% monthly after
  uint256 public AVAILABLE_ADVISOR_SUPPLY     =   15000000 * decimals;  // 100% Released on August 24th, 2018
  uint256 public AVAILABLE_RESERVE_SUPPLY     =  562500000 * decimals; // 10M Released every month after

  // IMPORTANT! The amounts above don't match and need to be reviewed

  uint256 public grandTotalAllocated = 0;
  uint256 public grandTotalClaimed = 0;
  uint256 public startTime;

  // Allocation with vesting information
  struct Allocation {
    uint8 AllocationSupply; // Type of allocation
    uint256 cliffDuration;  // Tokens are locked until
    uint256 endVesting;     // This is when the tokens are fully unvested
    uint256 totalAllocated; // Total tokens allocated
    uint256 amountClaimed;  // Total tokens claimed
  }
  mapping (address => Allocation) public allocations;

  event LogNewAllocation(address _recipient, string _fromSupply, uint256 _totalAllocated, uint256 _grandTotalAllocated);
  event LogPolyClaimed(address _recipient, uint8 _fromSupply, uint256 _amountClaimed, uint256 _totalAllocated, uint256 _grandTotalClaimed);

  /**
    * @dev Constructor function - Set the poly token address
    */
  function PolyDistribution() public {
    require(AVAILABLE_TOTAL_SUPPLY == AVAILABLE_PRESALE_SUPPLY.add(AVAILABLE_FOUNDER_SUPPLY).add(AVAILABLE_AIRDROP_SUPPLY).add(AVAILABLE_ADVISOR_SUPPLY).add(AVAILABLE_RESERVE_SUPPLY));
    startTime = now;
    POLY = new PolyToken(this);
  }

  /**
    * @dev Allow the owner of the contract to assign a new allocation
    * @param _recipient The recipient of the allocation
    * @param _totalAllocated The total amount of POLY available to the receipient (after vesting)
    * @param _supply The POLY supply the allocation will be taken from
    */
  function setAllocation (address _recipient, uint256 _totalAllocated, uint8 _supply) onlyOwner public {
    require(_supply >= 0 && _supply <= 4);
    require(_recipient != address(0));
    require(_totalAllocated > 0);
    require(allocations[_recipient].totalAllocated == 0);

    AllocationType selectedAllocationType;
    uint cliffDuration;
    uint endVesting;

    string memory fromSupply;
    if (_supply == 0) {
      fromSupply = 'presale';
      selectedAllocationType = AllocationType.PRESALE;
      cliffDuration = 0;
      endVesting = startTime;
      AVAILABLE_PRESALE_SUPPLY = AVAILABLE_PRESALE_SUPPLY.sub(_totalAllocated);

    } else if (_supply == 1) {
      fromSupply = 'founder';
      selectedAllocationType = AllocationType.FOUNDER;
      cliffDuration = startTime + 1 years;
      endVesting = startTime + 4 years;
      AVAILABLE_FOUNDER_SUPPLY = AVAILABLE_FOUNDER_SUPPLY.sub(_totalAllocated);

    } else if (_supply == 2) {
      fromSupply = 'airdrop';
      selectedAllocationType = AllocationType.AIRDROP;
      cliffDuration = 0;
      endVesting = startTime + 1 years;
      AVAILABLE_AIRDROP_SUPPLY = AVAILABLE_AIRDROP_SUPPLY.sub(_totalAllocated);

    } else if (_supply == 3) {
      fromSupply = 'advisor';
      selectedAllocationType = AllocationType.ADVISOR;
      cliffDuration = startTime + 215 days;
      endVesting = startTime;
      AVAILABLE_ADVISOR_SUPPLY = AVAILABLE_ADVISOR_SUPPLY.sub(_totalAllocated);

    } else if (_supply == 4) {
      fromSupply = 'reserve';
      cliffDuration = startTime + 100 days;
      endVesting = startTime + 4 years;
      selectedAllocationType = AllocationType.RESERVE;
      AVAILABLE_RESERVE_SUPPLY = AVAILABLE_RESERVE_SUPPLY.sub(_totalAllocated);
    }

    allocations[_recipient] = Allocation(uint8(selectedAllocationType), cliffDuration, endVesting , _totalAllocated, 0);

    grandTotalAllocated = grandTotalAllocated.add(_totalAllocated);

    LogNewAllocation(_recipient, fromSupply, _totalAllocated, grandTotalAllocated);
  }

  /**
    * @dev Allow the owner of the contract to modify an exisiting allocation
    * @param _recipient The recipient of the allocation
    * @param _totalAllocated The total amount of POLY available to the receipient (after vesting)
    */
  function updateAllocation(address _recipient, uint256 _totalAllocated) public onlyOwner {

  }

  /**
    * @dev Transfer a recipients available allocation to their address
    */
  function transferTokens (address _recipient) public {
    require(allocations[_recipient].amountClaimed < allocations[_recipient].totalAllocated);
    require(now >= allocations[_recipient].cliffDuration);

    uint tokensToTransfer = 0;
    uint totalAllocated = allocations[_recipient].totalAllocated;
    uint vestingTime = allocations[_recipient].endVesting;

    if (now >= vestingTime)
        tokensToTransfer = totalAllocated;
    else
        tokensToTransfer = totalAllocated.mul(now.sub(startTime)).div(vestingTime);

    uint tokensAlreadyClaimed = allocations[_recipient].amountClaimed;

    tokensToTransfer = tokensToTransfer.sub(tokensAlreadyClaimed);
    allocations[_recipient].amountClaimed = allocations[_recipient].amountClaimed.add(tokensToTransfer);

    grandTotalClaimed = grandTotalClaimed.add(tokensToTransfer);

    POLY.transfer(_recipient, tokensToTransfer);

    LogPolyClaimed(_recipient, allocations[_recipient].AllocationSupply, allocations[_recipient].amountClaimed, allocations[_recipient].totalAllocated, grandTotalClaimed);
  }

  // Prevent accidental ether payments to the contract
  function () public {
    revert();
  }

  // Allow transfer of accidentally sent ERC20 tokens
  function refundTokens(address _recipient, address _token) public onlyOwner {
    require(_token != address(this));
    IERC20 token = IERC20(_token);
    uint256 balance = token.balanceOf(this);
    token.transfer(_recipient, balance);
  }
}
