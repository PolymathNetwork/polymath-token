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
  enum AllocationType { PRESALE, FOUNDER, AIRDROP, ADVISOR, BONUS, RESERVE }
  uint256 public AVAILABLE_TOTAL_SUPPLY    = 1000000000 * decimals;
  uint256 public AVAILABLE_SALE_SUPPLY     = 240000000 * decimals; // 100% Released on Token Distribution (TD)
  uint256 public AVAILABLE_FOUNDER_SUPPLY  = 150000000 * decimals; // 25% Released TD +1 year + 100% released TD +4 years
  uint256 public AVAILABLE_AIRDROP_SUPPLY  = 10000000 * decimals;  // 10% Released on TD
  uint256 public AVAILABLE_ADVISOR_SUPPLY  = 25000000 * decimals;  // 100% Released on TD +
  uint256 public AVAILABLE_BONUS_SUPPLY    = 80000000 * decimals;  //
  uint256 public AVAILABLE_RESERVE_SUPPLY  = 495000000 * decimals; // 10M Released every month after
  uint256 grandTotalAllocated = 0;
  uint256 grandTotalClaimed = 0;
  uint256 startTime;

  // Allocation with vesting information
  struct Allocation {
    uint8 AllocationSupply; // Type of allocation
    uint256 endVesting;     // This is when the tokens are fully unvested
    uint256 endCliff;       // Tokens are locked until
    uint256 totalAllocated; // Total tokens allocated
    uint256 amountClaimed;  // Total tokens claimed
  }
  mapping (address => Allocation) public allocations;

  event LogNewAllocation(address _recipient, string _fromSupply, uint256 _totalAllocated, uint256 _grandTotalAllocated);
  event LogPolyClaimed(address _recipient, uint8 _fromSupply, uint256 _amountClaimed, uint256 _totalAllocated, uint256 _grandTotalClaimed);

  /**
    * @dev Constructor function - Set the poly token address
    * @param _startTime The time when PolyDistribution goes live
    */
    function PolyDistribution(uint256 _startTime) public {
      require(_startTime >= now);
      require(AVAILABLE_TOTAL_SUPPLY == AVAILABLE_SALE_SUPPLY.add(AVAILABLE_FOUNDER_SUPPLY).add(AVAILABLE_AIRDROP_SUPPLY).add(AVAILABLE_ADVISOR_SUPPLY).add(AVAILABLE_BONUS_SUPPLY).add(AVAILABLE_RESERVE_SUPPLY));
      startTime = _startTime;
      POLY = new PolyToken(this);
    }

  /**
    * @dev Allow the owner of the contract to assign a new allocation
    * @param _recipient The recipient of the allocation
    * @param _totalAllocated The total amount of POLY available to the receipient (after vesting)
    * @param _supply The POLY supply the allocation will be taken from
    */
  function setAllocation (address _recipient, uint256 _totalAllocated, uint8 _supply) onlyOwner public {
    require(allocations[_recipient].totalAllocated == 0);
    require(_supply >= 0 && _supply <= 5);
    require(_recipient != address(0));
    require(_totalAllocated > 0);
    require(startTime > 0);
    string memory fromSupply;
    if (_supply == 0) {
      fromSupply = 'sale';
      AVAILABLE_SALE_SUPPLY = AVAILABLE_SALE_SUPPLY.sub(_totalAllocated);
      allocations[_recipient] = Allocation(uint8(AllocationType.PRESALE), 0, 0, _totalAllocated, 0);
    } else if (_supply == 1) {
      fromSupply = 'founder';
      AVAILABLE_FOUNDER_SUPPLY = AVAILABLE_FOUNDER_SUPPLY.sub(_totalAllocated);
      allocations[_recipient] = Allocation(uint8(AllocationType.FOUNDER), startTime + 1 years, startTime + 4 years, _totalAllocated, 0);
    } else if (_supply == 2) {
      fromSupply = 'airdrop';
      AVAILABLE_AIRDROP_SUPPLY = AVAILABLE_AIRDROP_SUPPLY.sub(_totalAllocated);
      allocations[_recipient] = Allocation(uint8(AllocationType.AIRDROP), 0, startTime + 1 years, _totalAllocated, 0);
    } else if (_supply == 3) {
      fromSupply = 'advisor';
      AVAILABLE_ADVISOR_SUPPLY = AVAILABLE_ADVISOR_SUPPLY.sub(_totalAllocated);
      allocations[_recipient] = Allocation(uint8(AllocationType.ADVISOR), startTime + 212 days, 0, _totalAllocated, 0);
    } else if (_supply == 4) {
      fromSupply = 'bonus';
      AVAILABLE_BONUS_SUPPLY = AVAILABLE_BONUS_SUPPLY.sub(_totalAllocated);
      allocations[_recipient] = Allocation(uint8(AllocationType.BONUS), startTime + 1 years, startTime + 4 years, _totalAllocated, 0);
    } else if (_supply == 5) {
      fromSupply = 'reserve';
      AVAILABLE_RESERVE_SUPPLY = AVAILABLE_RESERVE_SUPPLY.sub(_totalAllocated);
      allocations[_recipient] = Allocation(uint8(AllocationType.RESERVE), startTime + 182 days, startTime + 4 years, _totalAllocated, 0);
    }
    grandTotalAllocated = grandTotalAllocated.add(_totalAllocated);
    LogNewAllocation(_recipient, fromSupply, _totalAllocated, grandTotalAllocated);
  }

  /**
    * @dev Transfer a recipients available allocation to their address
    * @param address The address to withdraw tokens for
    */
  function transferAllocation (address _recipient) public {
    require(allocations[_recipient].amountClaimed < allocations[_recipient].totalAllocated);
    require(now >= allocations[_recipient].endCliff);
    uint256 newAmountClaimed;
    if (allocations[_recipient].endVesting > now) {
      // Transfer available amount based on vesting schedule and allocation
      newAmountClaimed = allocations[_recipient].totalAllocated.mul(now.sub(startTime)).div(allocations[_recipient].endVesting.sub(startTime));
    } else {
      // Transfer total allocated (minus previously claimed tokens)
      newAmountClaimed = allocations[_recipient].totalAllocated;
    }
    uint256 tokensToTransfer = allocations[_recipient].totalAllocated.sub(allocations[_recipient].amountClaimed);
    allocations[_recipient].amountClaimed = newAmountClaimed;
    POLY.transfer(_recipient, tokensToTransfer);
    grandTotalClaimed = grandTotalClaimed.add(tokensToTransfer);
    LogPolyClaimed(_recipient, allocations[_recipient].AllocationSupply, tokensToTransfer, newAmountClaimed, grandTotalClaimed);
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
